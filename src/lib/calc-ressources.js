import {entitiyInfo} from "./info";

const cloneRes = r => ({food: r.food, wood: r.wood, gold: r.gold, stone: r.stone});

const subtractInPlace = (r1, r2) => {
  r1.food += -r2.food || 0;
  r1.wood += -r2.wood || 0;
  r1.gold += -r2.gold || 0;
  r1.stone += -r2.stone || 0;
};

const villEatRateByFoodType = {
  sheep: 0.33,
};

const performTask = (task, ressources) => {
  taskPerformer[task.type](task, ressources);
};

const taskPerformer = {
  create: ({meta}, ressources) => subtractInPlace(ressources, entitiyInfo[meta.createType].cost),
  build: ({meta}, ressources) => {
    if (meta.createdByMe) {
      subtractInPlace(ressources, entitiyInfo[meta.buildingType].cost);
    }
  },

  wood: (_, ressources) => {
    ressources.wood += 0.3;
  },
  eat: ({meta}, ressources) => {
    ressources.food += villEatRateByFoodType[meta.foodType];
  },
};

const resourceTasks = new Set(["create", "build", "eat", "wood", "gold", "stone"]);
const oneOffTasks = new Set(["create", "build"]);

export const calcRessources = (entities, starting, duration) => {
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
          performTask(task, currRes);
        } else {
          currentTasks.push(task);
        }
      }
    }
    const toBeDeleted = [];
    for (let idx = 0; idx < currentTasks.length; idx += 1) {
      const task = currentTasks[idx];
      performTask(task, currRes);
      if (i > task.start + task.duration) toBeDeleted.push(idx);
    }
    for (let idx of toBeDeleted) currentTasks.splice(idx, 1);

    resHistory.push(currRes);
    currRes = cloneRes(currRes);
  }
  return resHistory;
};
