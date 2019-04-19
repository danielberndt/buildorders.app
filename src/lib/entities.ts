import {Res} from "./types";

const rawBuildings = {
  house: {
    cost: {wood: 25},
    constructionTime: 25,
  },
  lumbercamp: {
    cost: {wood: 100},
    constructionTime: 35,
  },
  towncenter: {
    cost: {wood: 275, stone: 100},
    constructionTime: 999,
  },
  farm: {
    cost: {wood: 60},
    constructionTime: 999,
  },
  mill: {
    cost: {wood: 100},
    constructionTime: 999,
  },
};

export const buildings = rawBuildings as {
  [K in keyof typeof rawBuildings]: {cost: Partial<Res>; constructionTime: number}
};

const rawUnits = {
  villager: {
    cost: {food: 50},
    trainingTime: 25,
  },
};

export const units = rawUnits as {
  [K in keyof typeof rawUnits]: {cost: Partial<Res>; trainingTime: number}
};

const rawTechnologies = {
  loom: {
    cost: {gold: 50},
    researchTime: 999,
  },
  feudalAge: {
    cost: {food: 500},
    researchTime: 999,
  },
};

export const technologies = rawTechnologies as {
  [K in keyof typeof rawTechnologies]: {cost: Partial<Res>; researchTime: number}
};
