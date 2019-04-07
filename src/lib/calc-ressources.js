import {createArrayWith} from "./range";
import {entitiyInfo} from "./info";

const subtractInPlace = (r1, r2) => {
  r1.food += -r2.food || 0;
  r1.wood += -r2.wood || 0;
  r1.gold += -r2.gold || 0;
  r1.stone += -r2.stone || 0;
};

const add = (r1, r2) => ({
  food: r1.food + r2.food,
  wood: r1.wood + r2.wood,
  gold: r1.gold + r2.gold,
  stone: r1.stone + r2.stone,
});

const addForDuration = ({type, amount, start, duration, resDiffBySecond}) => {
  for (let s = start; s < start + duration; s += 1) {
    resDiffBySecond[s][type] += amount;
  }
};

const villEatRateByFoodType = {
  sheep: 0.33,
};

const taskPerformer = {
  create: ({start, meta}, resDiffBySecond) =>
    subtractInPlace(resDiffBySecond[start], entitiyInfo[meta.createType].cost),
  build: ({start, meta}, resDiffBySecond) =>
    subtractInPlace(resDiffBySecond[start], entitiyInfo[meta.buildingType].cost),
  wood: ({start, duration}, resDiffBySecond) =>
    addForDuration({type: "wood", amount: 0.3, start, duration, resDiffBySecond}),
  eat: ({start, duration, meta}, resDiffBySecond) =>
    addForDuration({
      type: "food",
      amount: villEatRateByFoodType[meta.foodType],
      start,
      duration,
      resDiffBySecond,
    }),
};

export const calcRessources = (entities, starting, duration) => {
  const resDiffBySecond = createArrayWith(duration + 1, () => ({
    food: 0,
    wood: 0,
    gold: 0,
    stone: 0,
  }));
  console.log("resDiffBySecond", duration, resDiffBySecond);
  entities.forEach(ent => {
    ent.tasks.forEach(task => {
      const fn = taskPerformer[task.type];
      if (fn) fn(task, resDiffBySecond);
    });
  });
  let last = starting;
  const resBySecond = new Array(duration + 1);
  for (let s = 0; s <= duration; s += 1) {
    resBySecond[s] = add(last, resDiffBySecond[s]);
    last = resBySecond[s];
  }
  return resBySecond;
};
