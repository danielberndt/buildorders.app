export const entitiyInfo = {
  villager: {
    type: "unit",
    cost: {food: 50},
    contructionTime: 25,
  },
  house: {
    type: "building",
    cost: {wood: 25},
    contructionTime: 25,
  },
  lumbercamp: {
    type: "building",
    cost: {wood: 100},
    contructionTime: 35,
  },
};

export const villGatheringData = {
  forage: {rawGatheringPerS: 0.31, carryingCapacity: 10, ressource: "food"},
  sheep: {rawGatheringPerS: 0.33, carryingCapacity: 10, ressource: "food"},
  hunt: {rawGatheringPerS: 0.41, carryingCapacity: 35, ressource: "food"},
  fish: {rawGatheringPerS: 0.43, carryingCapacity: 10, ressource: "food"},
  farm: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "food"},
  wood: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "wood"},
  gold: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "gold"},
  stone: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "stone"},
};

export const resPerUnit = {
  berries: 125,
  sheep: 100,
  deer: 140,
  boar: 340,
  wood: 10000,
  gold: 800,
  stone: 350,
  straggler: 100,
};

export const decayRates = {
  sheep: 0.25,
  deer: 0.25,
  boar: 0.4,
};

export const taskInfo = {
  create: {
    color: "blue",
  },
  walk: {color: "gray"},
  build: {color: "purple"},
  gather: {
    sheep: {color: "red"},
    wood: {color: "green"},
  },
  wait: {
    color: "light-gray",
  },
};
