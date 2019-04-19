export const buildings = {
  house: {
    cost: {wood: 25},
    contructionTime: 25,
  },
  lumbercamp: {
    cost: {wood: 100},
    contructionTime: 35,
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

export type Buildings = keyof typeof buildings;

export const units = {
  villager: {
    cost: {food: 50},
    trainingTime: 25,
  },
};

export type Units = keyof typeof units;

export const technologies = {
  loom: {
    cost: {gold: 50},
    researchTime: 999,
  },
  feudalAge: {
    cost: {food: 500},
    researchTime: 999,
  },
};

export type Technologies = keyof typeof technologies;
