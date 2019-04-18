import {gatherTypes, Res, ResPatch} from "./types";

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

export const villGatheringData: {
  [key in gatherTypes]: {rawGatheringPerS: number; carryingCapacity: number; ressource: keyof Res}
} = {
  forage: {rawGatheringPerS: 0.31, carryingCapacity: 10, ressource: "food"},
  sheep: {rawGatheringPerS: 0.33, carryingCapacity: 10, ressource: "food"},
  hunt: {rawGatheringPerS: 0.41, carryingCapacity: 35, ressource: "food"},
  fish: {rawGatheringPerS: 0.43, carryingCapacity: 10, ressource: "food"},
  farm: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "food"},
  wood: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "wood"},
  gold: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "gold"},
  stone: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "stone"},
};

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export const resPerUnit: {
  [key in PropType<ResPatch, "type">]: {amount: number; type: keyof Res}
} = {
  berries: {amount: 125, type: "food"},
  sheep: {amount: 100, type: "food"},
  deer: {amount: 140, type: "food"},
  boar: {amount: 340, type: "food"},
  wood: {amount: 10000, type: "wood"},
  gold: {amount: 800, type: "gold"},
  stone: {amount: 350, type: "stone"},
  stragglers: {amount: 100, type: "wood"},
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
