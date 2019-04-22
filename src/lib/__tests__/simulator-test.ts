import {getDefaultModifiers} from "../defaultModifiers";
import {simulateGame} from "../simulator";
import {Res, Instructions} from "../types";

const nullRes: Res = {wood: 0, food: 0, gold: 0, stone: 0};
const defaultModifiers = getDefaultModifiers().darkAge;

test("null case", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {},
    entities: {},
    tasks: {},
  };
  const {resHistory} = simulateGame(instructions, 10, defaultModifiers);
  expect(resHistory[9]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one sheep", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {
      sheep: {type: "sheep", count: 1, distance: 0},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "sheep"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 10, defaultModifiers);
  expect(resHistory[9]).toMatchInlineSnapshot(`
Object {
  "food": 1.9800000000000002,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 3,
    "type": "gather",
  },
]
`);
});

test("one sheep till the end", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {
      sheep: {type: "sheep", count: 1, distance: 0},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "sheep"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 200, defaultModifiers);
  expect(resHistory[199]).toMatchInlineSnapshot(`
Object {
  "food": 57.000000000000036,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 3,
    "type": "gather",
  },
  Object {
    "start": 176,
    "type": "wait",
  },
]
`);
});

test("building a house", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, wood: 100},
    resPatches: {},
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "build", building: "house", distance: 4, id: "h1"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 200, defaultModifiers);
  expect(resHistory[199]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 75,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 6,
    "type": "build",
  },
  Object {
    "start": 31,
    "type": "wait",
  },
]
`);
});

test("two building a house", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, wood: 100},
    resPatches: {},
    entities: {
      v1: {type: "villager"},
      v2: {type: "villager"},
    },
    tasks: {
      v1: [{type: "build", building: "house", distance: 4, id: "h1"}],
      v2: [{type: "build", building: "house", distance: 4, id: "h1"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 25, defaultModifiers);
  expect(resHistory[24]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 75,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 6,
    "type": "build",
  },
  Object {
    "start": 23,
    "type": "wait",
  },
]
`);
  expect(entities.v2.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 6,
    "type": "build",
  },
  Object {
    "start": 23,
    "type": "wait",
  },
]
`);
});

test("luring a boar", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {boar1: {type: "boar", distance: 15}},
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "lure", boarId: "boar1"}, {type: "gather", resId: "boar1"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 500, defaultModifiers);
  expect(resHistory[499]).toMatchInlineSnapshot(`
Object {
  "food": 172.19999999999885,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 24,
    "type": "walk",
  },
  Object {
    "start": 48,
    "type": "gather",
  },
  Object {
    "start": 469,
    "type": "wait",
  },
]
`);
});

test("cut stragglers till can build house", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {strgl: {type: "stragglers", count: 6, distance: 4}},
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [
        {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "house"}},
        {type: "build", building: "house", distance: 4},
      ],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 200, defaultModifiers);
  expect(resHistory[199]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 0.2875816993463829,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 6,
    "type": "gather",
  },
  Object {
    "start": 79,
    "type": "walk",
  },
  Object {
    "start": 87,
    "type": "build",
  },
  Object {
    "start": 112,
    "type": "wait",
  },
]
`);
});

test("train vill until enough food", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {
      strgl: {type: "stragglers", count: 6, distance: 4},
      sheep: {type: "sheep", count: 2, distance: 0},
    },
    entities: {
      tc: {type: "townCenter"},
      v1: {type: "villager"},
    },
    tasks: {
      v1: [
        {type: "gather", resId: "sheep", until: {type: "event", name: "trainingFinished-v2"}},
        {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "house"}},
        {type: "build", building: "house", distance: 4, id: "h1"},
      ],
      v2: [
        {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "house"}},
        {type: "build", building: "house", distance: 4, id: "h1"},
      ],
      tc: [
        {type: "wait", until: {type: "buildRes", entity: "villager"}},
        {type: "train", unit: "villager", id: `v2`},
      ],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 300, defaultModifiers);
  expect(resHistory[299]).toMatchInlineSnapshot(`
Object {
  "food": 8.409999999999826,
  "gold": 0,
  "stone": 0,
  "wood": 0.2875816993463829,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 3,
    "type": "gather",
  },
  Object {
    "start": 180,
    "type": "walk",
  },
  Object {
    "start": 186,
    "type": "gather",
  },
  Object {
    "start": 222,
    "type": "walk",
  },
  Object {
    "start": 230,
    "type": "build",
  },
  Object {
    "start": 247,
    "type": "wait",
  },
]
`);
  expect(entities.v2.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 180,
    "type": "walk",
  },
  Object {
    "start": 185,
    "type": "gather",
  },
  Object {
    "start": 222,
    "type": "walk",
  },
  Object {
    "start": 230,
    "type": "build",
  },
  Object {
    "start": 247,
    "type": "wait",
  },
]
`);
  expect(entities.tc.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "wait",
  },
  Object {
    "start": 155,
    "type": "train",
  },
  Object {
    "start": 180,
    "type": "wait",
  },
]
`);
});

test("do loom once enough gold", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {
      gold: {type: "gold", distance: 4},
    },
    entities: {
      tc: {type: "townCenter"},
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "gold", until: {type: "event", name: "researchFinished-loom"}}],
      tc: [
        {type: "wait", until: {type: "buildRes", entity: "loom"}},
        {type: "research", technology: "loom"},
      ],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 200, defaultModifiers);
  expect(resHistory[199]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 8.88888888888896,
  "stone": 0,
  "wood": 0,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 6,
    "type": "gather",
  },
  Object {
    "start": 176,
    "type": "wait",
  },
]
`);
  expect(entities.tc.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "wait",
  },
  Object {
    "start": 151,
    "type": "research",
  },
  Object {
    "start": 176,
    "type": "wait",
  },
]
`);
});

test("build lumbercamp at resources means less walking", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, wood: 100},
    resPatches: {
      wood: {type: "wood", distance: 10},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "build", building: "lumberCamp", atRes: "wood"}, {type: "gather", resId: "wood"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 200, defaultModifiers);
  expect(resHistory[199]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 68.79470198675513,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 13,
    "type": "build",
  },
  Object {
    "start": 48,
    "type": "walk",
  },
  Object {
    "start": 52,
    "type": "gather",
  },
]
`);
});

test("immediately does the right thing if several task's untils are met", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, wood: 100},
    resPatches: {
      sheep: {type: "sheep", count: 2, distance: 0},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [
        {type: "wait", until: {type: "buildRes", entity: "farm"}},
        {type: "gather", resId: "sheep", until: {type: "buildRes", entity: "house"}},
        {type: "build", building: "house", distance: 3},
      ],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 10, defaultModifiers);
  expect(resHistory[9]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 75,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 5,
    "type": "build",
  },
]
`);
});

test("build a farm and gather from it", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, wood: 100},
    resPatches: {},
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "build", building: "farm", id: "f1", distance: 0}, {type: "gather", resId: "f1"}],
    },
  };
  const {resHistory, entities} = simulateGame(instructions, 100, defaultModifiers);
  expect(resHistory[99]).toMatchInlineSnapshot(`
Object {
  "food": 28.058823529411733,
  "gold": 0,
  "stone": 0,
  "wood": 40,
}
`);
  expect(entities.v1.steps.map(s => ({type: s.desc.type, start: s.start}))).toMatchInlineSnapshot(`
Array [
  Object {
    "start": 0,
    "type": "walk",
  },
  Object {
    "start": 3,
    "type": "build",
  },
  Object {
    "start": 18,
    "type": "gather",
  },
]
`);
});
