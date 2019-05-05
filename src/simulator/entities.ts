import {Res, Technologies, Buildings} from "./types";
import {villGatheringData} from "./info";

const rawBuildings = {
  house: {
    icon: require("../images/buildings/dark-age/house.png"),
    cost: {food: 0, wood: 25, gold: 0, stone: 0},
    constructionTime: 25,
    popSpace: 5,
    requires: [],
  },
  lumberCamp: {
    icon: require("../images/buildings/dark-age/lumber-camp.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    popSpace: 0,
    requires: [],
  },
  miningCamp: {
    icon: require("../images/buildings/dark-age/mining-camp.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    popSpace: 0,
    requires: [],
  },
  townCenter: {
    icon: require("../images/buildings/castle-age/town-center.png"),
    cost: {food: 0, wood: 275, gold: 0, stone: 100},
    constructionTime: 999,
    popSpace: 5,
    requires: ["castleAge"],
  },
  farm: {
    icon: require("../images/buildings/dark-age/farm.png"),
    cost: {food: 0, wood: 60, gold: 0, stone: 0},
    constructionTime: 15,
    popSpace: 0,
    requires: ["mill"],
  },
  mill: {
    icon: require("../images/buildings/dark-age/mill.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 35,
    popSpace: 0,
    requires: [],
  },
  dock: {
    icon: require("../images/buildings/dark-age/dock.png"),
    cost: {food: 0, wood: 150, gold: 0, stone: 0},
    constructionTime: 35,
    popSpace: 0,
    requires: [],
  },
  barracks: {
    icon: require("../images/buildings/dark-age/barracks.png"),
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 50,
    popSpace: 0,
    requires: [],
  },
  outpost: {
    icon: require("../images/buildings/dark-age/outpost.png"),
    cost: {food: 0, wood: 25, gold: 0, stone: 5},
    constructionTime: 15,
    popSpace: 0,
    requires: [],
  },
  palisade: {
    icon: require("../images/buildings/dark-age/palisade.png"),
    cost: {food: 0, wood: 2, gold: 0, stone: 0},
    constructionTime: 6,
    popSpace: 0,
    requires: [],
  },
  palisadeGate: {
    icon: require("../images/buildings/dark-age/palisade-gate.png"),
    cost: {food: 0, wood: 20, gold: 0, stone: 0},
    constructionTime: 30,
    popSpace: 0,
    requires: [],
  },

  stable: {
    icon: require("../images/buildings/feudal-age/stable.png"),
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 50,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  blacksmith: {
    icon: require("../images/buildings/feudal-age/blacksmith.png"),
    cost: {food: 0, wood: 150, gold: 0, stone: 0},
    constructionTime: 40,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  fishTrap: {
    icon: require("../images/buildings/feudal-age/fish-trap.png"),
    cost: {food: 0, wood: 100, gold: 0, stone: 0},
    constructionTime: 40,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  market: {
    icon: require("../images/buildings/feudal-age/market.png"),
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 60,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  archeryRange: {
    icon: require("../images/buildings/feudal-age/archery-range.png"),
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 50,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  watchTower: {
    icon: require("../images/buildings/feudal-age/watch-tower.png"),
    cost: {food: 0, wood: 50, gold: 0, stone: 125},
    constructionTime: 80,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  gate: {
    icon: require("../images/buildings/feudal-age/gate.png"),
    cost: {food: 0, wood: 0, gold: 0, stone: 30},
    constructionTime: 70,
    popSpace: 0,
    requires: ["feudalAge"],
  },
  stoneWall: {
    icon: require("../images/buildings/feudal-age/stone-wall.png"),
    cost: {food: 0, wood: 0, gold: 0, stone: 5},
    constructionTime: 10,
    popSpace: 0,
    requires: ["feudalAge"],
  },

  monastery: {
    icon: require("../images/buildings/castle-age/monastery.png"),
    cost: {food: 0, wood: 175, gold: 0, stone: 0},
    constructionTime: 40,
    popSpace: 0,
    requires: ["castleAge"],
  },
  castle: {
    icon: require("../images/buildings/castle-age/castle.png"),
    cost: {food: 0, wood: 0, gold: 0, stone: 650},
    constructionTime: 200,
    popSpace: 0,
    requires: ["castleAge"],
  },
  siegeWorkshop: {
    icon: require("../images/buildings/castle-age/siege-workshop.png"),
    cost: {food: 0, wood: 200, gold: 0, stone: 0},
    constructionTime: 40,
    popSpace: 0,
    requires: ["castleAge", "blacksmith"],
  },
  university: {
    icon: require("../images/buildings/castle-age/university.png"),
    cost: {food: 0, wood: 200, gold: 0, stone: 0},
    constructionTime: 60,
    popSpace: 0,
    requires: ["castleAge"],
  },
};

export const buildings = rawBuildings as {
  [K in keyof typeof rawBuildings]: {
    icon: string;
    cost: Res;
    constructionTime: number;
    popSpace: number;
    requires: (Technologies | Buildings)[];
  }
};

const rawUnits = {
  villager: {
    icon: [
      require("../images/units/dark-age/villager-female.png"),
      require("../images/units/dark-age/villager-male.png"),
    ],
    cost: {food: 50, wood: 0, gold: 0, stone: 0},
    trainingTime: 25,
    trainedIn: "townCenter",
    requires: [],
  },
  fishingShip: {
    icon: require("../images/units/dark-age/fishing-ship.png"),
    cost: {food: 0, wood: 75, gold: 0, stone: 0},
    trainingTime: 50,
    trainedIn: "dock",
    requires: [],
  },
  transportShip: {
    icon: require("../images/units/dark-age/transport-ship.png"),
    cost: {food: 0, wood: 125, gold: 0, stone: 0},
    trainingTime: 45,
    trainedIn: "dock",
    requires: [],
  },
  militia: {
    icon: require("../images/units/dark-age/militia.png"),
    cost: {food: 60, wood: 0, gold: 20, stone: 0},
    trainingTime: 21,
    trainedIn: "barracks",
    requires: [],
    upgradeTechs: [
      {technology: "manAtArms", icon: require("../images/units/feudal-age/man-at-arms.png")},
    ],
  },

  scoutCavalry: {
    icon: require("../images/units/feudal-age/scout-cavalry.png"),
    cost: {food: 80, wood: 0, gold: 0, stone: 0},
    trainingTime: 30,
    trainedIn: "stable",
    requires: ["feudalAge"],
  },
  tradeCog: {
    icon: require("../images/units/feudal-age/trade-cog.png"),
    cost: {food: 0, wood: 100, gold: 50, stone: 0},
    trainingTime: 36,
    trainedIn: "dock",
    requires: ["feudalAge"],
  },
  tradeCart: {
    icon: require("../images/units/feudal-age/trade-cart.png"),
    cost: {food: 0, wood: 100, gold: 50, stone: 0},
    trainingTime: 51,
    trainedIn: "market",
    requires: ["feudalAge"],
  },
  spearman: {
    icon: require("../images/units/feudal-age/spearman.png"),
    cost: {food: 35, wood: 25, gold: 0, stone: 0},
    trainingTime: 22,
    trainedIn: "barracks",
    requires: ["feudalAge"],
  },
  eagleScout: {
    icon: require("../images/units/feudal-age/eagle-scout.png"),
    cost: {food: 20, wood: 0, gold: 50, stone: 0},
    trainingTime: 35,
    trainedIn: "barracks",
    requires: ["feudalAge"],
  },
  archer: {
    icon: require("../images/units/feudal-age/archer.png"),
    cost: {food: 0, wood: 25, gold: 45, stone: 0},
    trainingTime: 35,
    trainedIn: "archeryRange",
    requires: ["feudalAge"],
  },
  skirmisher: {
    icon: require("../images/units/feudal-age/skirmisher.png"),
    cost: {food: 25, wood: 35, gold: 0, stone: 0},
    trainingTime: 22,
    trainedIn: "archeryRange",
    requires: ["feudalAge"],
  },
  galley: {
    icon: require("../images/units/feudal-age/galley.png"),
    cost: {food: 0, wood: 90, gold: 30, stone: 0},
    trainingTime: 60,
    trainedIn: "dock",
    requires: ["feudalAge"],
  },
  demolitionRaft: {
    icon: require("../images/units/feudal-age/demolition-raft.png"),
    cost: {food: 0, wood: 70, gold: 50, stone: 0},
    trainingTime: 45,
    trainedIn: "dock",
    requires: ["feudalAge"],
  },
  fireGalley: {
    icon: require("../images/units/feudal-age/fire-galley.png"),
    cost: {food: 0, wood: 75, gold: 45, stone: 0},
    trainingTime: 60,
    trainedIn: "dock",
    requires: ["feudalAge"],
  },

  camel: {
    icon: require("../images/units/castle-age/camel.png"),
    cost: {food: 55, wood: 0, gold: 60, stone: 0},
    trainingTime: 22,
    trainedIn: "stable",
    requires: ["castleAge"],
  },
  cavalryArcher: {
    icon: require("../images/units/castle-age/cavalry-archer.png"),
    cost: {food: 0, wood: 40, gold: 60, stone: 0},
    trainingTime: 34,
    trainedIn: "archery",
    requires: ["castleAge"],
  },
  genitour: {
    icon: require("../images/units/castle-age/genitour.png"),
    cost: {food: 50, wood: 35, gold: 60, stone: 0},
    trainingTime: 25,
    trainedIn: "archery",
    requires: ["castleAge"],
  },

  handCannoneer: {
    icon: require("../images/units/imperial-age/hand-cannoneer.png"),
    cost: {food: 45, wood: 0, gold: 50, stone: 0},
    trainingTime: 34,
    trainedIn: "archery",
    requires: ["imperialAge", "chemistry"],
  },
  bombardCannon: {
    icon: require("../images/units/imperial-age/bombard-cannon.png"),
    cost: {food: 0, wood: 225, gold: 225, stone: 0},
    trainingTime: 56,
    trainedIn: "siegeWorkshop",
    requires: ["imperialAge", "chemistry"],
  },
  cannonGalleon: {
    icon: require("../images/units/imperial-age/cannon-galleon.png"),
    cost: {food: 0, wood: 200, gold: 150, stone: 0},
    trainingTime: 46,
    trainedIn: "dock",
    requires: ["imperialAge", "cannonGalleonTech"],
  },
};

export const units = rawUnits as {
  [K in keyof typeof rawUnits]: {
    icon: string | string[];
    cost: Res;
    trainingTime: number;
    trainedIn: keyof typeof rawBuildings;
    requires: (Technologies | Buildings)[];
    upgradeTechs?: {
      technology: Technologies;
      icon: string | string[];
    }[];
  }
};

const rawTechnologies = {
  loom: {
    icon: require("../images/technologies/dark-age/loom.png"),
    cost: {food: 0, wood: 0, gold: 50, stone: 0},
    researchTime: 25,
    requires: [],
    researchedIn: "townCenter",
  },
  feudalAge: {
    icon: require("../images/technologies/dark-age/feudal-age.png"),
    cost: {food: 500, wood: 0, gold: 0, stone: 0},
    researchTime: 130,
    requires: [],
    researchedIn: "townCenter",
  },

  townWatch: {
    icon: require("../images/technologies/feudal-age/town-watch.png"),
    cost: {food: 75, wood: 0, gold: 0, stone: 0},
    researchTime: 25,
    requires: ["feudalAge"],
    researchedIn: "townCenter",
  },
  wheelbarrow: {
    icon: require("../images/technologies/feudal-age/wheelbarrow.png"),
    cost: {food: 175, wood: 50, gold: 0, stone: 0},
    researchTime: 75,
    requires: ["feudalAge"],
    researchedIn: "townCenter",
    improves: {
      villagers: {
        walkingSpeedMultiplier: {value: 1.1, operation: "multiply"},
      },
      gathering: Object.keys(villGatheringData).reduce((m: any, key) => {
        m[key] = {extraCarryingMultiplier: {value: 1.25, operation: "multiply"}};
        return m;
      }, {}),
    },
  },
  castleAge: {
    icon: require("../images/technologies/feudal-age/castle-age.png"),
    cost: {food: 800, wood: 0, gold: 200, stone: 0},
    researchTime: 160,
    requires: ["feudalAge"],
    researchedIn: "townCenter",
  },
  horseCollar: {
    icon: require("../images/technologies/feudal-age/horse-collar.png"),
    cost: {food: 75, wood: 75, gold: 0, stone: 0},
    researchTime: 20,
    requires: ["feudalAge"],
    researchedIn: "mill",
    improves: {
      farmExtraFood: {value: 75, operation: "add"},
    },
  },
  doubleBitAxe: {
    icon: require("../images/technologies/feudal-age/double-bit-axe.png"),
    cost: {food: 100, wood: 50, gold: 0, stone: 0},
    researchTime: 25,
    requires: ["feudalAge"],
    researchedIn: "lumberCamp",
    improves: {
      gathering: {cuttingWood: {gatheringMultiplier: {value: 1.2, operation: "multiply"}}},
    },
  },
  stoneMining: {
    icon: require("../images/technologies/feudal-age/stone-mining.png"),
    cost: {food: 100, wood: 75, gold: 0, stone: 0},
    researchTime: 30,
    requires: ["feudalAge"],
    researchedIn: "miningCamp",
    improves: {
      gathering: {miningStone: {gatheringMultiplier: {value: 1.15, operation: "multiply"}}},
    },
  },
  goldMining: {
    icon: require("../images/technologies/feudal-age/gold-mining.png"),
    cost: {food: 100, wood: 75, gold: 0, stone: 0},
    researchTime: 30,
    requires: ["feudalAge"],
    researchedIn: "miningCamp",
    improves: {
      gathering: {miningGold: {gatheringMultiplier: {value: 1.15, operation: "multiply"}}},
    },
  },
  cartography: {
    icon: require("../images/technologies/feudal-age/cartography.png"),
    cost: {food: 0, wood: 0, gold: 0, stone: 0},
    researchTime: 0,
    requires: ["feudalAge"],
    researchedIn: "market",
  },

  tracking: {
    icon: require("../images/technologies/feudal-age/tracking.png"),
    cost: {food: 50, wood: 0, gold: 0, stone: 0},
    researchTime: 35,
    requires: ["feudalAge"],
    researchedIn: "barracks",
  },
  manAtArms: {
    icon: require("../images/technologies/feudal-age/man-at-arms.png"),
    cost: {food: 100, wood: 0, gold: 45, stone: 0},
    researchTime: 40,
    requires: ["feudalAge"],
    researchedIn: "barracks",
  },

  bloodlines: {
    icon: require("../images/technologies/feudal-age/bloodlines.png"),
    cost: {food: 150, wood: 0, gold: 100, stone: 0},
    researchTime: 25,
    requires: ["feudalAge"],
    researchedIn: "stable",
  },

  scaleMailArmor: {
    icon: require("../images/technologies/feudal-age/scale-mail-armor.png"),
    cost: {food: 100, wood: 0, gold: 0, stone: 0},
    researchTime: 40,
    requires: ["feudalAge"],
    researchedIn: "blacksmith",
  },
  fletching: {
    icon: require("../images/technologies/feudal-age/fletching.png"),
    cost: {food: 100, wood: 0, gold: 50, stone: 0},
    researchTime: 30,
    requires: ["feudalAge"],
    researchedIn: "blacksmith",
  },
  paddedArcherArmor: {
    icon: require("../images/technologies/feudal-age/padded-archer-armor.png"),
    cost: {food: 100, wood: 0, gold: 0, stone: 0},
    researchTime: 40,
    requires: ["feudalAge"],
    researchedIn: "blacksmith",
  },
  forging: {
    icon: require("../images/technologies/feudal-age/forging.png"),
    cost: {food: 150, wood: 0, gold: 0, stone: 0},
    researchTime: 50,
    requires: ["feudalAge"],
    researchedIn: "blacksmith",
  },
  scaleBardingArmor: {
    icon: require("../images/technologies/feudal-age/scale-barding-armor.png"),
    cost: {food: 150, wood: 0, gold: 0, stone: 0},
    researchTime: 45,
    requires: ["feudalAge"],
    researchedIn: "blacksmith",
  },

  pikeman: {
    icon: require("../images/technologies/castle-age/pikeman.png"),
    cost: {food: 215, wood: 0, gold: 90, stone: 0},
    researchTime: 45,
    requires: ["castleAge"],
    researchedIn: "barracks",
  },
  lightCavalry: {
    icon: require("../images/technologies/castle-age/light-cavalry.png"),
    cost: {food: 150, wood: 0, gold: 50, stone: 0},
    researchTime: 45,
    requires: ["castleAge"],
    researchedIn: "stable",
  },
  guardTower: {
    icon: require("../images/technologies/castle-age/guard-tower.png"),
    cost: {food: 100, wood: 250, gold: 0, stone: 0},
    researchTime: 30,
    requires: ["castleAge"],
    researchedIn: "university",
  },
  murderHoles: {
    icon: require("../images/technologies/castle-age/murder-holes.png"),
    cost: {food: 200, wood: 0, gold: 0, stone: 100},
    researchTime: 60,
    requires: ["castleAge"],
    researchedIn: "university",
  },
  ironCasting: {
    icon: require("../images/technologies/castle-age/iron-casting.png"),
    cost: {food: 220, wood: 0, gold: 120, stone: 0},
    researchTime: 75,
    requires: ["castleAge", "forging"],
    researchedIn: "blacksmith",
  },
  coinage: {
    icon: require("../images/technologies/castle-age/coinage.png"),
    cost: {food: 200, wood: 0, gold: 100, stone: 0},
    researchTime: 70,
    requires: ["castleAge"],
    researchedIn: "market",
  },

  bowSaw: {
    icon: require("../images/technologies/castle-age/bow-saw.png"),
    cost: {food: 150, wood: 100, gold: 0, stone: 0},
    researchTime: 50,
    requires: ["castleAge", "doubleBitAxe"],
    researchedIn: "lumbercamp",
    improves: {
      gathering: {cuttingWood: {gatheringMultiplier: {value: 1.2, operation: "multiply"}}},
    },
  },
  heavyPlow: {
    icon: require("../images/technologies/castle-age/heavy-plow.png"),
    cost: {food: 125, wood: 125, gold: 0, stone: 0},
    researchTime: 40,
    requires: ["castleAge", "horseCollar"],
    researchedIn: "mill",
    improves: {
      farmExtraFood: {value: 125, operation: "add"},
      gathering: {
        farming: {extraCarryingCapacity: {value: 1, operation: "add"}},
        // I guess by it's description that it affects all food?
        foraging: {extraCarryingCapacity: {value: 1, operation: "add"}},
        eatingSheep: {extraCarryingCapacity: {value: 1, operation: "add"}},
        hunting: {extraCarryingCapacity: {value: 1, operation: "add"}},
        fishing: {extraCarryingCapacity: {value: 1, operation: "add"}},
      },
    },
  },
  handCart: {
    icon: require("../images/technologies/castle-age/hand-cart.png"),
    cost: {food: 300, wood: 200, gold: 0, stone: 0},
    researchTime: 55,
    requires: ["castleAge", "wheelbarrow"],
    researchedIn: "townCenter",
    improves: {
      villagers: {
        walkingSpeedMultiplier: {value: 1.1, operation: "multiply"},
      },
      gathering: Object.keys(villGatheringData).reduce((m: any, key) => {
        m[key] = {extraCarryingMultiplier: {value: 1.5, operation: "multiply"}};
        return m;
      }, {}),
    },
  },
  imperialAge: {
    icon: require("../images/technologies/castle-age/imperial-age.png"),
    cost: {food: 1000, wood: 0, gold: 800, stone: 0},
    researchTime: 190,
    requires: ["castleAge"],
    researchedIn: "townCenter",
  },

  keep: {
    icon: require("../images/technologies/imperial-age/keep.png"),
    cost: {food: 500, wood: 350, gold: 0, stone: 0},
    researchTime: 75,
    requires: ["imperialAge", "guardTower"],
    researchedIn: "university",
  },
  chemistry: {
    icon: require("../images/technologies/imperial-age/chemistry.png"),
    cost: {food: 300, wood: 0, gold: 200, stone: 0},
    researchTime: 100,
    requires: ["imperialAge"],
    researchedIn: "university",
  },

  cannonGalleonTech: {
    icon: require("../images/technologies/imperial-age/cannon-galleon.png"),
    cost: {food: 400, wood: 500, gold: 0, stone: 0},
    researchTime: 50,
    requires: ["imperialAge", "chemistry"],
    researchedIn: "dock",
  },
  eliteCannonGalleon: {
    icon: require("../images/technologies/imperial-age/elite-cannon-galleon.png"),
    cost: {food: 0, wood: 525, gold: 500, stone: 0},
    researchTime: 30,
    requires: ["imperialAge", "cannonGalleonTech"],
    researchedIn: "dock",
  },
  hussar: {
    // are they really reusing the same icon here?
    icon: require("../images/technologies/castle-age/light-cavalry.png"),
    cost: {food: 500, wood: 0, gold: 600, stone: 0},
    researchTime: 50,
    requires: ["imperialAge", "lightCavalry"],
    researchedIn: "stable",
  },

  blastFurnace: {
    icon: require("../images/technologies/imperial-age/blast-furnace.png"),
    cost: {food: 275, wood: 0, gold: 225, stone: 0},
    researchTime: 100,
    requires: ["imperialAge", "ironCasting"],
    researchedIn: "blacksmith",
  },
  bombardTowerTech: {
    icon: require("../images/technologies/imperial-age/bombard-tower.png"),
    cost: {food: 800, wood: 400, gold: 0, stone: 0},
    researchTime: 60,
    requires: ["imperialAge", "chemistry"],
    researchedIn: "university",
  },
  conscription: {
    icon: require("../images/technologies/imperial-age/bombard-tower.png"),
    cost: {food: 150, wood: 0, gold: 150, stone: 0},
    researchTime: 60,
    requires: ["imperialAge"],
    researchedIn: "castle",
    improves: {
      // TODO: units from stable, barracks, archery range, castle => trainingSpeedMul: 0.67
    },
  },
  twoManSaw: {
    icon: require("../images/technologies/imperial-age/two-man-saw.png"),
    cost: {food: 300, wood: 200, gold: 0, stone: 0},
    researchTime: 100,
    requires: ["imperialAge", "bowSaw"],
    researchedIn: "lumbercamp",
    improves: {
      gathering: {cuttingWood: {gatheringMultiplier: {value: 1.1, operation: "multiply"}}},
    },
  },
  cropRotation: {
    icon: require("../images/technologies/imperial-age/crop-rotation.png"),
    cost: {food: 250, wood: 250, gold: 0, stone: 0},
    researchTime: 40,
    requires: ["imperialAge", "heavyPlow"],
    researchedIn: "mill",
    improves: {
      farmExtraFood: {value: 175, operation: "add"},
    },
  },
};

export const technologies = rawTechnologies as {
  [K in keyof typeof rawTechnologies]: {
    icon: string;
    cost: Res;
    researchTime: number;
    requires: (Technologies | Buildings)[];
    researchedIn: Buildings;
    improves?: any;
  }
};

export const ressources = {
  boar: {icon: require("../images/ressources/boar.png")},
  sheep: {icon: require("../images/ressources/sheep.png")},
  deer: {icon: require("../images/ressources/deer.png")},
  berries: {icon: require("../images/ressources/berries.png")},
  gold: {icon: require("../images/ressources/gold.png")},
  stone: {icon: require("../images/ressources/stone.png")},
  wood: {icon: require("../images/ressources/wood.png")},
  farm: {icon: require("../images/buildings/dark-age/farm.png")},
};

export const allEntities = {...units, ...buildings, ...technologies};
