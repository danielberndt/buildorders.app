import {entitiyInfo} from "./info";

const cloneRes = r => ({food: r.food, wood: r.wood, gold: r.gold, stone: r.stone});

const subtractInPlace = (r1, r2) => {
  r1.food += -r2.food || 0;
  r1.wood += -r2.wood || 0;
  r1.gold += -r2.gold || 0;
  r1.stone += -r2.stone || 0;
};

// thanks SOL! https://www.youtube.com/watch?v=Hca1oSsOPh4
const resPerSecond = (capacity, distance, gatheringRate, walkingSpeedModifier) =>
  capacity / (capacity / gatheringRate + (2 * distance) / (0.8 * walkingSpeedModifier));

const villGatheringData = {
  forage: {rawGatheringPerS: 0.31, carryingCapacity: 10, ressource: "food"},
  sheep: {rawGatheringPerS: 0.33, carryingCapacity: 10, ressource: "food"},
  hunt: {rawGatheringPerS: 0.41, carryingCapacity: 35, ressource: "food"},
  fish: {rawGatheringPerS: 0.43, carryingCapacity: 10, ressource: "food"},
  farm: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "food"},
  wood: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "wood"},
  gold: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "gold"},
  stone: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "stone"},
};

const performTask = (task, ressources, modifiers) => {
  taskPerformer[task.type](task, ressources, modifiers);
};

const taskPerformer = {
  create: ({meta}, ressources) => subtractInPlace(ressources, entitiyInfo[meta.createType].cost),
  build: ({meta}, ressources) => {
    if (meta.createdByMe) {
      subtractInPlace(ressources, entitiyInfo[meta.buildingType].cost);
    }
  },

  gather: ({meta}, ressources, modifiers) => {
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
      // TODO: take distance of farm from tc into account! (simething like this one below)
      // return rawRate + 1 - (2 * meta.distance) / (0.8 * modifiers.villagers.walkingSpeedMultiplier)
      ressources[ressource] += rawRate;
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
