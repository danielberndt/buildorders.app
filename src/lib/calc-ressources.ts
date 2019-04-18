import {entitiyInfo, resPerUnit, decayRates, villGatheringData} from "./info";
import {Res, gatherTypes, taskTypes, ResPatches, EnhancedResPatches} from "./types";
import {Modifiers} from "./defaultModifiers";

const cloneRes = (r: Res): Res => ({food: r.food, wood: r.wood, gold: r.gold, stone: r.stone});

const subtractInPlace = (r1: Res, r2: Res) => {
  r1.food += -r2.food || 0;
  r1.wood += -r2.wood || 0;
  r1.gold += -r2.gold || 0;
  r1.stone += -r2.stone || 0;
};

// thanks SOL! https://www.youtube.com/watch?v=Hca1oSsOPh4
const resPerSecond = (
  capacity: number,
  distance: number,
  gatheringRate: number,
  walkingSpeedMultiplier: number
) => capacity / (capacity / gatheringRate + (2 * distance) / (0.8 * walkingSpeedMultiplier));

const gather = (type: gatherTypes, distance: number, modifiers: Modifiers) => {
  const {rawGatheringPerS, carryingCapacity} = villGatheringData[type];
  const {gatheringMultiplier, extraCarryingCapacity} = modifiers.gathering[type];
  if (type === "farm") {
    // according to https://www.reddit.com/r/aoe2/comments/7d9b9k/some_updated_completed_farming_workrate_values/
    const rawRate = Math.min(
      24 / 60,
      resPerSecond(
        carryingCapacity + extraCarryingCapacity,
        4,
        rawGatheringPerS * gatheringMultiplier,
        modifiers.villagers.walkingSpeedMultiplier
      )
    );
    return resPerSecond(
      carryingCapacity + extraCarryingCapacity,
      distance,
      rawRate,
      modifiers.villagers.walkingSpeedMultiplier
    );
  } else {
    return resPerSecond(
      carryingCapacity + extraCarryingCapacity,
      distance,
      rawGatheringPerS * gatheringMultiplier,
      modifiers.villagers.walkingSpeedMultiplier
    );
  }
};

const nextIds: {[key: string]: number} = {};
const generateId = (type: string, name: string) => {
  const key = `${type}-${name[0]}`;
  if (!nextIds[key]) nextIds[key] = 0;
  return (nextIds[key] += 1);
};

type TaskToDist = (task: Task, resPatches: ResPatches) => number;

const taskToDistance: {[key in taskTypes]: TaskToDist} = {
  build: ({distance, atRes}, resPatches) => (atRes ? resPatches[atRes].distance : distance),
  gather: ({resId}, resPatches) => resPatches[resId].distance,
  lure: ({boarId}, resPatches) => resPatches[boarId].distance + 4, // because we've got arrows, but need to run through tc
};

const taskToStep = {
  build: ({task}) => {
    const {type, building, id: maybeId} = task;
    const id = maybeId || generateId("build", building);
    return {
      type,
      building,
      id,
      until: [{type: "event", name: `buldingFinish-${id}`}],
    };
  },
  gather: ({task, resPatches}) => {
    const {type, resId, until} = task;
    const res = resPatches[resId];
    return {
      type,
      resType: res.type,
      resId,
      until: [...(until ? [until] : []), {type: "event", name: `resDepleted-${resId}`}],
    };
  },
  lure: ({task}) => {
    const walkDist = euclidianDist(entitiyInfo.distanceFromTC, 0);
    const {boarId} = task;
    return {
      type: "walk",
      luringBoarId: boarId,
      endLocation: 0,
      remainingDistance: walkDist,
      until: [{type: "atTarget"}],
    };
  },
  wait: ({task, time}) => {
    const {type, until} = task;
    return {type, start: time, until: [...(until ? [until] : [])]};
  },
};

const euclidianDist = (d1, d2) => (d1 * d1 + d2 * d2) ** 0.5;

const getNextStepDesc = (entity, resPatches, time) => {
  const nextTask = entity.remainingTasks[0] || {type: "wait"};
  // check if we need to walk there first
  const distanceFn = taskToDistance[entity.type];
  if (distanceFn) {
    const taskDistFromTc = distanceFn(nextTask, resPatches);
    const walkDist = euclidianDist(entity.distanceFromTC, taskDistFromTc);
    if (walkDist > 0) {
      return {
        type: "walk",
        endLocation: taskDistFromTc,
        remainingDistance: walkDist,
        until: [{type: "atTarget"}],
      };
    }
  } else {
    entity.remainingTasks.shift();
    return taskToStep({entity, task: nextTask, resPatches, time});
  }
};

const getNextStep = (entity, resPatches, time) => {
  const taskDesc = getNextStepDesc(entity, resPatches, time);
  return {desc: taskDesc, entity, start: time};
};

const onFinishStep = {};

const processConditions = (
  currentSteps,
  time,
  events,
  modifiers,
  currRes,
  resPatches,
  addToEntityIfNotFinished
) => {
  const queueNewSteps = [];
  currentSteps.forEach((step, i) => {
    if (isStepCompleted(step, events, modifiers, currRes)) {
      onFinishStep[step.desc.type]();
      queueNewSteps.push(getNextStep(step.entity, resPatches, time));
      currentSteps.splice(i, 1);
    } else if (addToEntityIfNotFinished) {
      step.entity.steps.push(step);
    }
  });

  while (queueNewSteps.length) {
    const step = queueNewSteps.shift();
    if (isStepCompleted(step, events, modifiers, currRes)) {
      onFinishStep[step.desc.type]();
      queueNewSteps(getNextStep(step.entity, resPatches, time));
    } else {
      currentSteps.push(step);
    }
  }
};

const enhanceRessources = (resPatches: ResPatches, modifiers: Modifiers) => {
  const enhanced: EnhancedResPatches = {};
  Object.entries(resPatches).forEach(([id, res]) => {
    enhanced[id] = {
      ...res,
      resType: villGatheringData[res.type].ressource,
      remaining:
        resPerUnit[res.subtype || res.type] *
        (res.count || 1) *
        modifiers.ressourceDurationMultiplier,
    };
  });
  return enhanced;
};

const canAfford = (currRes, cost) => {
  return (
    currRes.food >= cost.food &&
    currRes.wood >= cost.wood &&
    currRes.gold >= cost.gold &&
    currRes.stone >= cost.stone
  );
};

const conditionFulfilled = {
  event: ({cond: {name}, events}) => events.has(name),
  atTarget: ({step}) => step.desc.remainingDistance === 0,
  buildRes: ({cond: {building}, modifiers, currRes}) => {
    const cost = entitiyInfo[building];
    const mod = modifiers.entities[building];
    return canAfford(currRes, {
      food: cost.food,
      wood: cost.wood * mod.buildingWoodCostMultiplier,
      gold: cost.gold,
      stone: cost.stone * mod.buildingStoneCostMultiplier,
    });
  },
};

const isStepCompleted = (step, events, modifiers, currRes) =>
  step.desc.until.some(cond => conditionFulfilled[cond.type]({cond, events, modifiers, currRes}));

export const simulateGame = (instructions, duration, modifiers) => {
  let currRes = cloneRes(instructions.starting);
  const resHistory = [];

  const resPatches = enhanceRessources(instructions.resPatches, modifiers);
  Object.entries(resPatches).forEach(([id, res]) => {
    const decayRate = decayRates[res.type];
    if (decayRate) {
      decayableRes[id] = {
        decayRate,
        hasBeenTouched: false,
        patch: res,
      };
    }
  });

  const entities = {};
  const currentSteps = [];
  Object.entries(instructions.entites).forEach(([id, {type}]) => {
    const entity = {
      type,
      createdAt: 0,
      steps: [],
      remainingTasks: instructions.tasks[id],
      distanceFromTC: type === "villager" ? 3 : null,
    };
    currentSteps.push(getNextStep(entity, resPatches, 0));
    entities[id] = entity;
  });

  const events = new Set();
  processConditions(currentSteps, 0, events, modifiers, currRes, resPatches, true);

  const decayableRes = {};
  const constructions = {};

  /*
  loop:

  - do spoilage for sheep/deer/boars that have been gathered from in last tick.
  - mark res as non-gathered

  - perform tasks
    - gathering: set `gathered-this-tick` flag, make sure you res not depleted yet, add event if depeleted
    - building:
      - check if construction id already exists,
      - if not, subtract res, create construction entitiy with HP,
      - add builder to each construction
    - walk:
      - subtract remainingDistance
      - if luring, update boar distance

  - calc construction progress
    - add to HP per builder, add event & entity if completed

  - check if end/until conditions are met
    - lure: fire event "lure_${boarId}"
    - if endLocation, update ent.distanceFromTC
    - getNextTask check if end/until conditions are met
  */

  for (let t = 0; t < duration; t += 1) {
    for (const res of Object.values(decayableRes)) {
      if (res.hasBeenTouched) {
        res.patch.remaining = Math.max(0, res.patch.remaining - res.decayRate);
        res.hasBeenTouched = false;
      }
    }

    for (const step of currentSteps) {
      const {desc} = step;
      if (desc.type === "building") {
        const {id, building} = desc;
        if (!constructions[id]) {
          const {contructionTime, cost} = entitiyInfo[building];
          constructions[id] = {builders: 0, timeLeft: contructionTime, building};
          subtractInPlace(currRes, cost);
        }
        constructions[id].builders += 1;
      } else if (desc.type === "walk") {
        const {luringBoarId, remainingDistance} = desc;
        const nextDist = remainingDistance - 0.8 * modifiers.villages.walkingSpeedMultiplier;
        desc.remainingDistance = Math.max(0, nextDist);
        if (desc.remainingDistance === 0 && luringBoarId) {
          resPatches[luringBoarId].distance = 0;
        }
      } else if (desc.type === "gather") {
        const {resId} = desc;
        const res = resPatches[resId];
        if (res.remaining >= 0) {
          const decayRes = decayableRes[resId];
          if (decayRes) decayRes.hasBeenTouched = true;
          let gatherAmount = gather(res.type, res.distance, modifiers);
          res.remaining -= gatherAmount;
          if (res.remaining <= 0) {
            gatherAmount += res.remaining;
            res.remaining = 0;
            events.add(`resDepleted-${resId}`);
          }
          currRes[res.resType] += gatherAmount;
        }
      } else {
        console.log("dunno", desc.type);
      }
    }

    for (const [id, construction] of Object.entries(constructions)) {
      if (construction.builders > 0) {
        construction.timeLeft -= 3 / (construction.builders + 2);
      }
      construction.builders = 0;
      if (construction.timeLeft <= 0) {
        events.add(`buldingFinish-${id}`);
        // maybe mark "resAt" ressource as non-tc walkable
        entities[id] = {
          type: construction.building.building,
          createdAt: t,
          steps: [],
          remainingTasks: instructions.tasks[id],
          distanceFromTC: null,
        };
      }
    }

    processConditions(currentSteps, 0, events, modifiers, currRes, resPatches, true);
    resHistory.push(currRes);
    currRes = cloneRes(currRes);
  }

  return {resHistory, entities};
};
