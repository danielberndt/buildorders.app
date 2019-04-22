import {Res} from "./types";

type Ages = "darkAge" | "feudalAge" | "castleAge" | "imperialAge";

const rawBuildings = {
  house: {
    icon: require("../images/buildings/dark-age/house.png"),
    cost: {food: 0, wood: 25, gold: 0, stone: 0},
    constructionTime: 25,
    startAge: "darkAge",
  },
  lumberCamp: {
    icon: require("../images/buildings/dark-age/lumber-camp.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  miningCamp: {
    icon: require("../images/buildings/dark-age/mining-camp.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  townCenter: {
    icon: require("../images/buildings/castle-age/town-center.png"),
    cost: {food: 0, wood: 275, gold: 0, stone: 100},
    constructionTime: 999,
    startAge: "darkAge",
  },
  farm: {
    icon: require("../images/buildings/dark-age/farm.png"),
    cost: {food: 0, wood: 60, gold: 0, stone: 0},
    constructionTime: 15,
    startAge: "darkAge",
  },
  mill: {
    icon: require("../images/buildings/dark-age/mill.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  dock: {
    icon: require("../images/buildings/dark-age/dock.png"),
    cost: {food: 0, wood: 150, gold: 0, stone: 0},
    constructionTime: 35,
    startAge: "darkAge",
  },
  barracks: {
    icon: require("../images/buildings/dark-age/barracks.png"),
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 50,
    startAge: "darkAge",
  },
  outpost: {
    icon: require("../images/buildings/dark-age/outpost.png"),
    cost: {food: 0, wood: 25, gold: 0, stone: 5},
    constructionTime: 15,
    startAge: "darkAge",
  },
  palisade: {
    icon: require("../images/buildings/dark-age/palisade.png"),
    cost: {food: 0, wood: 2, gold: 0, stone: 0},
    constructionTime: 6,
    startAge: "darkAge",
  },
  palisadeGate: {
    icon: require("../images/buildings/dark-age/palisade-gate.png"),
    cost: {food: 0, wood: 20, gold: 0, stone: 0},
    constructionTime: 30,
    startAge: "darkAge",
  },
};

export const buildings = rawBuildings as {
  [K in keyof typeof rawBuildings]: {
    icon: string;
    cost: Res;
    constructionTime: number;
    startAge: Ages;
  }
};

const rawUnits = {
  villager: {
    icon: require("../images/units/dark-age/villager-male.png"),
    cost: {food: 50, wood: 0, gold: 0, stone: 0},
    trainingTime: 25,
    trainedIn: "townCenter",
    startAge: "darkAge",
  },
  fishingShip: {
    icon: require("../images/units/dark-age/fishing-ship.png"),
    cost: {food: 0, wood: 75, gold: 0, stone: 0},
    trainingTime: 50,
    trainedIn: "dock",
    startAge: "darkAge",
  },
  transportShip: {
    icon: require("../images/units/dark-age/transport-ship.png"),
    cost: {food: 0, wood: 125, gold: 0, stone: 0},
    trainingTime: 45,
    trainedIn: "dock",
    startAge: "darkAge",
  },
  militia: {
    icon: require("../images/units/dark-age/militia.png"),
    cost: {food: 60, wood: 0, gold: 20, stone: 0},
    trainingTime: 21,
    trainedIn: "barracks",
    startAge: "darkAge",
  },
};

export const units = rawUnits as {
  [K in keyof typeof rawUnits]: {
    icon: string;
    cost: Res;
    trainingTime: number;
    trainedIn: keyof typeof rawBuildings;
    startAge: Ages;
  }
};

const rawTechnologies = {
  loom: {
    icon: require("../images/technologies/dark-age/loom.png"),
    cost: {food: 0, wood: 0, gold: 50, stone: 0},
    researchTime: 25,
    startAge: "darkAge",
  },
  feudalAge: {
    icon: require("../images/technologies/dark-age/feudal-age.png"),
    cost: {food: 500, wood: 0, gold: 0, stone: 0},
    researchTime: 130,
    startAge: "darkAge",
  },
};

export const technologies = rawTechnologies as {
  [K in keyof typeof rawTechnologies]: {
    icon: string;
    cost: Res;
    researchTime: number;
    startAge: Ages;
  }
};