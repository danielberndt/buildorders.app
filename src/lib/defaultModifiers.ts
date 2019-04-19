import {GatherTypes} from "./types";

export type Modifiers = ReturnType<typeof getDefaultOneAge>;

const boringBuilding = {
  buildingWoodCostMultiplier: 1,
  buildingStoneCostMultiplier: 1,
  buildingSpeedMultiplier: 1,
};

const researchOnlyBuilding = {
  ...boringBuilding,
  researchSpeedMultiplier: 1,
  researchCostMultiplier: 1,
};
const unitProductionBuilding = {
  ...researchOnlyBuilding,
  unitProductionSpeedMultiplier: 1,
  unitCostMultiplier: 1,
};

const getDefaultOneAge = () => ({
  extraRessources: {food: 0, wood: 0, stone: 0, gold: 0},
  freeTechs: {}, // {towncenter: ["loom"]}
  farmExtraFood: 0,
  ressourceDurationMultiplier: 1,

  gathering: {
    foraging: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    eatingSheep: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    hunting: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    fishing: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    farming: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    cuttingWood: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    miningGold: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    miningStone: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
  } as {[key in GatherTypes]: {gatheringMultiplier: number; extraCarryingCapacity: number}},
  villagers: {
    walkingSpeedMultiplier: 1,
  },
  buildings: {
    farm: {...boringBuilding},
    house: {...boringBuilding},
    palisade: {...boringBuilding},
    gate: {...boringBuilding},
    lumbercamp: {...researchOnlyBuilding},
    miningcamp: {...researchOnlyBuilding},
    mill: {...researchOnlyBuilding},
    dock: {...unitProductionBuilding},
    towncenter: {...unitProductionBuilding, agingSpeedMultiplier: 1, agingCostMultiplier: 1},
    baracks: {...unitProductionBuilding},
  },
});

export const getDefaultModifiers = () => ({
  darkAge: getDefaultOneAge(),
  feudalAge: getDefaultOneAge(),
  castleAge: getDefaultOneAge(),
  imperialAge: getDefaultOneAge(),
});
