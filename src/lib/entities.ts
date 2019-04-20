import {Res} from "./types";

const rawBuildings = {
  house: {
    cost: {food: 0, wood: 25, gold: 0, stone: 0},
    constructionTime: 25,
  },
  lumbercamp: {
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
  },
  towncenter: {
    cost: {food: 0, wood: 275, gold: 0, stone: 100},
    constructionTime: 999,
  },
  farm: {
    cost: {food: 0, wood: 60, gold: 0, stone: 0},
    constructionTime: 999,
  },
  mill: {
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 999,
  },
};

export const buildings = rawBuildings as {
  [K in keyof typeof rawBuildings]: {cost: Res; constructionTime: number}
};

const rawUnits = {
  villager: {
    cost: {food: 50, wood: 0, gold: 0, stone: 0},
    trainingTime: 25,
  },
};

export const units = rawUnits as {[K in keyof typeof rawUnits]: {cost: Res; trainingTime: number}};

const rawTechnologies = {
  loom: {
    cost: {food: 0, wood: 0, gold: 50, stone: 0},
    researchTime: 999,
  },
  feudalAge: {
    cost: {food: 500, wood: 0, gold: 0, stone: 0},
    researchTime: 999,
  },
};

export const technologies = rawTechnologies as {
  [K in keyof typeof rawTechnologies]: {cost: Res; researchTime: number}
};
