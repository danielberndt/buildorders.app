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
};
