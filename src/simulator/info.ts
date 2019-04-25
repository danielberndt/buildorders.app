import {GatherTypes, Res, ResPatch, PropType, StepTypes, Omit} from "./types";

export const villGatheringData: {
  [key in GatherTypes]: {rawGatheringPerS: number; carryingCapacity: number; ressource: keyof Res}
} = {
  foraging: {rawGatheringPerS: 0.31, carryingCapacity: 10, ressource: "food"},
  eatingSheep: {rawGatheringPerS: 0.33, carryingCapacity: 10, ressource: "food"},
  hunting: {rawGatheringPerS: 0.41, carryingCapacity: 35, ressource: "food"},
  fishing: {rawGatheringPerS: 0.43, carryingCapacity: 10, ressource: "food"},
  farming: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "food"},
  cuttingWood: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "wood"},
  miningGold: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "gold"},
  miningStone: {rawGatheringPerS: 0.53, carryingCapacity: 10, ressource: "stone"},
};

export const resPerUnit: {
  [key in PropType<ResPatch, "type">]: {amount: number; activity: GatherTypes; hp?: number}
} = {
  berries: {amount: 125, activity: "foraging"},
  sheep: {amount: 100, activity: "eatingSheep"},
  deer: {amount: 140, activity: "hunting"},
  boar: {amount: 340, activity: "hunting", hp: 75},
  wood: {amount: 10000, activity: "cuttingWood"},
  gold: {amount: 800, activity: "miningGold"},
  stone: {amount: 350, activity: "miningStone"},
  stragglers: {amount: 100, activity: "cuttingWood"},
  farm: {amount: 175, activity: "farming"},
};

export const decayRates = {
  sheep: 0.25,
  deer: 0.25,
  boar: 0.4,
};
