import {Res} from "./types";

type Ages = "darkAge" | "feudalAge" | "castleAge" | "imperialAge";

const rawBuildings = {
  house: {
    cost: {food: 0, wood: 25, gold: 0, stone: 0},
    constructionTime: 25,
    startAge: "darkAge",
  },
  lumberCamp: {
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  miningCamp: {
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  townCenter: {
    cost: {food: 0, wood: 275, gold: 0, stone: 100},
    constructionTime: 999,
    startAge: "darkAge",
  },
  farm: {
    cost: {food: 0, wood: 60, gold: 0, stone: 0},
    constructionTime: 15,
    startAge: "darkAge",
  },
  mill: {
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  dock: {
    cost: {food: 0, wood: 150, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  baracks: {
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 50,
    startAge: "darkAge",
  },
  outpost: {
    cost: {food: 0, wood: 25, gold: 0, stone: 5},
    constructionTime: 15,
    startAge: "darkAge",
  },
  palisade: {
    cost: {food: 0, wood: 2, gold: 0, stone: 0},
    constructionTime: 6,
    startAge: "darkAge",
  },
  palisadeGate: {
    cost: {food: 0, wood: 20, gold: 0, stone: 0},
    constructionTime: 30,
    startAge: "darkAge",
  },
};

export const buildings = rawBuildings as {
  [K in keyof typeof rawBuildings]: {cost: Res; constructionTime: number; startAge: Ages}
};

const rawUnits = {
  villager: {
    cost: {food: 50, wood: 0, gold: 0, stone: 0},
    trainingTime: 25,
    trainedIn: "townCenter",
    startAge: "darkAge",
  },
  fishingShip: {
    cost: {food: 0, wood: 75, gold: 0, stone: 0},
    trainingTime: 50,
    trainedIn: "dock",
    startAge: "darkAge",
  },
  transportShip: {
    cost: {food: 0, wood: 125, gold: 0, stone: 0},
    trainingTime: 45,
    trainedIn: "dock",
    startAge: "darkAge",
  },
  militia: {
    cost: {food: 60, wood: 0, gold: 20, stone: 0},
    trainingTime: 21,
    trainedIn: "barracks",
    startAge: "darkAge",
  },
};

export const units = rawUnits as {
  [K in keyof typeof rawUnits]: {
    cost: Res;
    trainingTime: number;
    trainedIn: keyof typeof rawBuildings;
    startAge: Ages;
  }
};

const rawTechnologies = {
  loom: {
    cost: {food: 0, wood: 0, gold: 50, stone: 0},
    researchTime: 25,
    startAge: "darkAge",
  },
  feudalAge: {
    cost: {food: 500, wood: 0, gold: 0, stone: 0},
    researchTime: 130,
    startAge: "darkAge",
  },
};

export const technologies = rawTechnologies as {
  [K in keyof typeof rawTechnologies]: {cost: Res; researchTime: number; startAge: Ages}
};
