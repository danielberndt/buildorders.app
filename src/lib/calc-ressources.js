import {entitiyInfo, resPerUnit, decayRes, villGatheringData} from "./info";

const cloneRes = r => ({food: r.food, wood: r.wood, gold: r.gold, stone: r.stone});

const subtractInPlace = (r1, r2) => {
  r1.food += -r2.food || 0;
  r1.wood += -r2.wood || 0;
  r1.gold += -r2.gold || 0;
  r1.stone += -r2.stone || 0;
};

// thanks SOL! https://www.youtube.com/watch?v=Hca1oSsOPh4
const resPerSecond = (capacity, distance, gatheringRate, walkingSpeedMultiplier) =>
  capacity / (capacity / gatheringRate + (2 * distance) / (0.8 * walkingSpeedMultiplier));

const performTask = (task, ressources, modifiers) => {
  taskPerformer[task.type](task, ressources, modifiers);
};

const gather = (type, distance, modifiers) => {
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

const taskPerformer = {
  create: ({meta}, ressources) => subtractInPlace(ressources, entitiyInfo[meta.createType].cost),
  build: ({meta}, ressources) => {
    if (meta.createdByMe) {
      subtractInPlace(ressources, entitiyInfo[meta.buildingType].cost);
    }
  },

  gather: (meta, ressources, modifiers) => {
    const {rawGatheringPerS, carryingCapacity, ressource} = villGatheringData[meta.type];
    const {gatheringMultiplier, extraCarryingCapacity} = modifiers.gathering[meta.type];
    if (meta.type === "farm") {
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
      ressources[ressource] += resPerSecond(
        carryingCapacity + extraCarryingCapacity,
        meta.distance,
        rawRate,
        modifiers.villagers.walkingSpeedMultiplier
      );
    } else {
      ressources[ressource] += resPerSecond(
        carryingCapacity + extraCarryingCapacity,
        meta.distance,
        rawGatheringPerS * gatheringMultiplier,
        modifiers.villagers.walkingSpeedMultiplier
      );
    }
  },
};

const resourceTasks = new Set(["create", "build", "gather"]);
const oneOffTasks = new Set(["create", "build"]);

export const calcRessources = (entities, starting, duration, modifiers) => {
  const currentModifiers = modifiers.darkAge;

  const taskStarts = new Array(duration);
  entities.forEach(ent => {
    ent.tasks.forEach(task => {
      if (task.start < duration && resourceTasks.has(task.type)) {
        (taskStarts[task.start] = taskStarts[task.start] || []).push(task);
      }
    });
  });
  let currRes = cloneRes(starting);
  const resHistory = [];
  const currentTasks = [];

  for (let i = 0; i < duration; i += 1) {
    const startNowTasks = taskStarts[i];
    if (startNowTasks) {
      for (let task of startNowTasks) {
        if (oneOffTasks.has(task.type)) {
          performTask(task, currRes, currentModifiers);
        } else {
          currentTasks.push(task);
        }
      }
    }
    const toBeDeleted = [];
    for (let idx = 0; idx < currentTasks.length; idx += 1) {
      const task = currentTasks[idx];
      performTask(task, currRes, currentModifiers);
      if (i > task.start + task.duration) toBeDeleted.push(idx);
    }
    for (let idx of toBeDeleted) currentTasks.splice(idx, 1);

    resHistory.push(currRes);
    currRes = cloneRes(currRes);
  }
  return resHistory;
};

const nextIds = {};
const generateId = (type, name) => {
  const key = `${type}-${name[0]}`;
  if (!nextIds[key]) nextIds[key] = 0;
  return (nextIds[key] += 1);
};

const taskToDistance = {
  build: ({distance, atRes}, resPatches) => (atRes ? resPatches[atRes].distance : distance),
  gather: ({resId}, resPatches) => resPatches[resId].distance,
  lure: ({boarId}, resPatches) => resPatches[boarId].distance + 4, // because we've got arrows, but need to run through tc
};

const taskToStep = {
  build: ({task, time}) => {
    const {type, building, id: maybeId} = task;
    const id = maybeId || generateId("build", building);
    return {
      type,
      start: time,
      building,
      id,
      task,
      until: [{type: "event", name: `buldingFinish-${id}`}],
    };
  },
  gather: ({task, time, resPatches}) => {
    const {type, resId, until} = task;
    const res = resPatches[resId];
    return {
      type,
      start: time,
      resType: res.type,
      resId,
      task,
      until: [...(until ? [until] : []), {type: "event", name: `resDepleted-${resId}`}],
    };
  },
  lure: ({entity, task, time}) => {
    const walkDist = euclidianDist(entitiyInfo.distanceFromTC, 0);
    const {boarId} = task;
    entity.steps.push({
      type: "walk",
      luringBoarId: boarId,
      start: time,
      task,
      endLocation: 0,
      remainingDistance: walkDist,
      until: [{type: "atTarget"}],
    });
  },
  wait: ({task, time}) => {
    const {type, until} = task;
    return {type, start: time, task, until: [...(until ? [until] : [])]};
  },
};

const euclidianDist = (d1, d2) => (d1 * d1 + d2 * d2) ** 0.5;

const getNextTask = (entity, resPatches, time, modifiers) => {
  const nextTask = entity.remainingTasks[0] || {type: "wait"};
  // check if we need to walk there first
  const distanceFn = taskToDistance[entity.type];
  if (distanceFn) {
    const taskDistFromTc = distanceFn(nextTask, resPatches);
    const walkDist = euclidianDist(entity.distanceFromTC, taskDistFromTc);
    if (walkDist > 0) {
      return {
        type: "walk",
        start: time,
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

const enhanceRessources = (resPatches, modifiers) => {
  const enhanced = {};
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

export const simulateGame = (instructions, duration, modifiers) => {
  let currRes = cloneRes(instructions.starting);
  const resHistory = [];
  const entities = {};
  Object.entries(instructions.entites).forEach(
    ([id, {type}]) =>
      (entities[id] = {
        type,
        createdAt: 0,
        steps: [],
        remainingTasks: instructions.tasks[id],
        distanceFromTC: type === "villager" ? 3 : null,
      })
  );
  const resPatches = enhanceRessources(instructions.resPatches, modifiers);
  const decayableRes = {};
  Object.entries(resPatches).forEach(([id, res]) => {
    const decayRate = decayRes[res.type];
    if (decayRate) {
      decayableRes[id] = {
        decayRate,
        hasBeenTouched: false,
        patch: res,
      };
    }
  });

  const constructions = {};
  const events = new Set();
  const currentSteps = Object.values(entities).map(e => getNextTask(e, resPatches, 0, modifiers));

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
      if (step.type === "building") {
        const {id, building} = step;
        if (!constructions[id]) {
          const {contructionTime, cost} = entitiyInfo[building];
          constructions[id] = {builders: 0, timeLeft: contructionTime, building};
          subtractInPlace(currRes, cost);
        }
        constructions[id].builders += 1;
      } else if (step.type === "walk") {
        const {luringBoarId, remainingDistance} = step;
        const nextDist = remainingDistance - 0.8 * modifiers.villages.walkingSpeedMultiplier;
        step.remainingDistance = Math.max(0, nextDist);
        if (step.remainingDistance === 0 && luringBoarId) {
          resPatches[luringBoarId].distance = 0;
        }
      } else if (step.type === "gather") {
        const {resId} = step;
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
      }
    }

    for (const [id, construction] of Object.entries(constructions)) {
      if (construction.builders > 0) {
        construction.timeLeft -= 3 / (construction.builders + 2);
      }
      construction.builders = 0;
      if (construction.timeLeft <= 0) {
        events.add(`buldingFinish-${id}`);
        // entities.push();
        // use code from above, maybe mark "resAt" ressource as non-tc walkable
      }
    }
  }

  // const

  // Object.values(entities).forEach()
};
