const boringBuilding = {
  buildingCostMultiplier: 1,
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
  // no real modifiers, just bonuses?
  // extraRessources: {food: 0, wood: 0, stone: 0, gold: 0},
  // freeTechs: {}, // {towncenter: ["loom"]}
  // farmExtraFood: 0,
  // ressourceDurationMultiplier: 1,

  gathering: {
    sheep: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    fish: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    hunt: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    farm: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    forage: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    wood: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    gold: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
    stone: {gatheringMultiplier: 1, extraCarryingCapacity: 0},
  },
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
