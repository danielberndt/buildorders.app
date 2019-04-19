import {resPerUnit, decayRates, villGatheringData} from "./info";
import {
  Res,
  GatherTypes,
  ResPatches,
  EnhancedResPatches,
  Instructions,
  Step,
  Entity,
  EnhancedResPatch,
  StepTypes,
  Task,
  TaskType,
  PropType,
  FindByType,
  StepDesc,
  Until,
  Constructions,
} from "./types";
import {Modifiers} from "./defaultModifiers";
import {units, technologies, buildings} from "./entities";

const cloneRes = (r: Res): Res => ({food: r.food, wood: r.wood, gold: r.gold, stone: r.stone});

const subtractInPlace = (r1: Res, r2: Partial<Res>) => {
  r1.food += -(r2.food || 0);
  r1.wood += -(r2.wood || 0);
  r1.gold += -(r2.gold || 0);
  r1.stone += -(r2.stone || 0);
};

// thanks SOL! https://www.youtube.com/watch?v=Hca1oSsOPh4
const resPerSecond = (
  capacity: number,
  distance: number,
  gatheringRate: number,
  walkingSpeedMultiplier: number
) => capacity / (capacity / gatheringRate + (2 * distance) / (0.8 * walkingSpeedMultiplier));

const gather = (type: GatherTypes, distance: number, modifiers: Modifiers) => {
  const {rawGatheringPerS, carryingCapacity} = villGatheringData[type];
  const {gatheringMultiplier, extraCarryingCapacity} = modifiers.gathering[type];
  if (type === "farming") {
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
  return `${key}-${(nextIds[key] += 1)}`;
};

type TaskToDist = {
  [P in TaskType]?: (task: FindByType<Task, P>, resPatches: EnhancedResPatches) => number
};

const taskToDistance: TaskToDist = {
  build: (task, resPatches) => ("atRes" in task ? resPatches[task.atRes].distance : task.distance),
  gather: ({resId}, resPatches) => resPatches[resId].distance,
  lure: ({boarId}, resPatches) => resPatches[boarId].distance + 4, // because we've got arrows, but need to run through tc
};

type TaskToStepDesc = {
  [P in TaskType]: (opts: {
    task: FindByType<Task, P>;
    entity: Entity;
    resPatches: EnhancedResPatches;
  }) => StepDesc
};

const taskToStepDesc: TaskToStepDesc = {
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
    const {activity} = resPerUnit[res.type];

    return {
      type,
      resId,
      activity,
      until: [...(until ? [until] : []), {type: "event", name: `resDepleted-${resId}`}],
    };
  },
  lure: ({task, entity}) => {
    const walkDist = euclidianDist(entity.distanceFromTC || 0, 0);
    const {boarId} = task;
    return {
      type: "walk",
      luringBoarId: boarId,
      endLocation: 0,
      remainingDistance: walkDist,
      until: [{type: "atTarget"}],
    };
  },
  wait: ({task}) => {
    const {type, until} = task;
    return {type, until: [...(until ? [until] : [])]};
  },
  train: ({task}) => {
    const {type, unit, id: maybeId} = task;
    const id = maybeId || generateId("unit", unit);
    const info = units[unit];
    return {type, unit, id, remainingTime: info.trainingTime};
  },
  research: ({task}) => {
    const {type, technology} = task;
    const info = technologies[technology];
    return {type, technology, remainingTime: info.researchTime};
  },
};

const euclidianDist = (d1: number, d2: number) => (d1 * d1 + d2 * d2) ** 0.5;

const getNextStepDesc = (entity: Entity, resPatches: EnhancedResPatches): StepDesc => {
  const nextTask = entity.remainingTasks[0] || {type: "wait"};
  // check if we need to walk there first
  const distanceFn = taskToDistance[nextTask.type];
  if (distanceFn && entity.distanceFromTC !== null) {
    const taskDistFromTc = distanceFn(nextTask as any, resPatches);
    const walkDist = euclidianDist(entity.distanceFromTC, taskDistFromTc);
    if (walkDist > 0) {
      return {
        type: "walk",
        endLocation: taskDistFromTc,
        remainingDistance: walkDist,
        until: [{type: "atTarget"}],
      };
    }
  }
  entity.remainingTasks.shift();
  return taskToStepDesc[nextTask.type]({entity, task: nextTask as any, resPatches});
};

const getNextStep = (entity: Entity, resPatches: EnhancedResPatches, time: number): Step => {
  const taskDesc = getNextStepDesc(entity, resPatches);
  return {desc: taskDesc, entity, start: time};
};

const onFinishStep: {[key in StepTypes]: () => void} = {};

const processConditions = (
  currentSteps: Step[],
  time: number,
  events: Set<string>,
  modifiers: Modifiers,
  currRes: Res,
  resPatches: EnhancedResPatches,
  addToEntityIfNotFinished: boolean
) => {
  const queueNewSteps: Step[] = [];
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
    const step = queueNewSteps.shift() as Step;
    if (isStepCompleted(step, events, modifiers, currRes)) {
      onFinishStep[step.desc.type]();
      queueNewSteps.push(getNextStep(step.entity, resPatches, time));
    } else {
      currentSteps.push(step);
    }
  }
};

const enhanceRessources = (resPatches: ResPatches, modifiers: Modifiers) => {
  const enhanced: EnhancedResPatches = {};
  Object.entries(resPatches).forEach(([id, res]) => {
    const {activity, amount} = resPerUnit[res.type];
    enhanced[id] = {
      ...res,
      resType: villGatheringData[activity].ressource,
      remaining: amount * ("count" in res ? res.count : 1) * modifiers.ressourceDurationMultiplier,
    };
  });
  return enhanced;
};

const canAfford = (currRes: Res, cost: Res) => {
  return (
    currRes.food >= cost.food &&
    currRes.wood >= cost.wood &&
    currRes.gold >= cost.gold &&
    currRes.stone >= cost.stone
  );
};

type ConditionFulfilledObj = {
  [P in PropType<Until, "type">]: (opts: {
    cond: FindByType<Until, P>;
    events: Set<string>;
    step: Step;
    modifiers: Modifiers;
    currRes: Res;
  }) => boolean
};

const conditionFulfilled: ConditionFulfilledObj = {
  event: ({cond: {name}, events}) => events.has(name),
  atTarget: ({step}) =>
    "remainingDistance" in step.desc ? step.desc.remainingDistance === 0 : false,
  buildRes: ({cond: {building}, modifiers, currRes}) => {
    const {cost} = buildings[building];
    const mod = modifiers.buildings[building];
    return canAfford(currRes, {
      food: cost.food || 0,
      wood: (cost.wood || 0) * mod.buildingWoodCostMultiplier,
      gold: cost.gold || 0,
      stone: (cost.stone || 0) * mod.buildingStoneCostMultiplier,
    });
  },
};

const isStepCompleted = (step: Step, events: Set<string>, modifiers: Modifiers, currRes: Res) =>
  step.desc.until &&
  step.desc.until.some(cond =>
    conditionFulfilled[cond.type]({cond: cond as any, step, events, modifiers, currRes})
  );

export const simulateGame = (
  instructions: Instructions,
  duration: number,
  modifiers: Modifiers
) => {
  let currRes = cloneRes(instructions.startingRes);
  const resHistory: Res[] = [];

  const resPatches = enhanceRessources(instructions.resPatches, modifiers);
  const decayableRes: {
    [id: string]: {decayRate: number; hasBeenTouched: boolean; patch: EnhancedResPatch};
  } = {};
  Object.entries(resPatches).forEach(([id, res]) => {
    if (res.type in decayRates) {
      decayableRes[id] = {
        decayRate: decayRates[res.type as keyof typeof decayRates],
        hasBeenTouched: false,
        patch: res,
      };
    }
  });

  const entities: {[id: string]: Entity} = {};
  const currentSteps: Step[] = [];
  Object.entries(instructions.entities).forEach(([id, {type}]) => {
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

  const constructions: Constructions = {};

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
      if (desc.type === "build") {
        const {id, building} = desc;
        if (!constructions[id]) {
          const {constructionTime, cost} = buildings[building];
          constructions[id] = {builders: 0, timeLeft: constructionTime, building};
          subtractInPlace(currRes, cost);
        }
        constructions[id].builders += 1;
      } else if (desc.type === "walk") {
        const {luringBoarId, remainingDistance} = desc;
        const nextDist = remainingDistance - 0.8 * modifiers.villagers.walkingSpeedMultiplier;
        desc.remainingDistance = Math.max(0, nextDist);
        if (desc.remainingDistance === 0 && luringBoarId) {
          resPatches[luringBoarId].distance = 0;
        }
      } else if (desc.type === "gather") {
        const {resId, activity} = desc;
        const res = resPatches[resId];
        if (res.remaining >= 0) {
          const decayRes = decayableRes[resId];
          if (decayRes) decayRes.hasBeenTouched = true;
          let gatherAmount = gather(activity, res.distance, modifiers);
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
          type: construction.building,
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
