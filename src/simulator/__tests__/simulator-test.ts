import {getDefaultModifiers} from "../defaultModifiers";
import {simulateGame} from "..";
import {Res, Instructions} from "../types";

const nullRes: Res = {wood: 0, food: 0, gold: 0, stone: 0};
const defaultModifiers = getDefaultModifiers;

test("null case", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {},
    entities: {},
    tasks: {},
  };
  const {resAndPopHistory} = simulateGame(instructions, 10, defaultModifiers());
  expect(resAndPopHistory[9]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 0,
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
  const {resAndPopHistory, entities} = simulateGame(instructions, 10, defaultModifiers());
  expect(resAndPopHistory[9]).toMatchInlineSnapshot(`
    Object {
      "food": 1.9800000000000002,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 0,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
  const {resAndPopHistory, entities} = simulateGame(instructions, 200, defaultModifiers());
  expect(resAndPopHistory[199]).toMatchInlineSnapshot(`
    Object {
      "food": 57.000000000000036,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 0,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
  const {resAndPopHistory, entities} = simulateGame(instructions, 200, defaultModifiers());
  expect(resAndPopHistory[199]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 0,
      "maxPopSpace": 5,
      "popSpace": 1,
      "stone": 0,
      "wood": 75,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
  const {resAndPopHistory, entities} = simulateGame(instructions, 25, defaultModifiers());
  expect(resAndPopHistory[24]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 0,
      "maxPopSpace": 5,
      "popSpace": 2,
      "stone": 0,
      "wood": 75,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
  expect(entities.v2.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
      v1: [
        {type: "lure", boarId: "boar1"},
        {type: "gather", resId: "boar1"},
      ],
    },
  };
  const {resAndPopHistory, entities} = simulateGame(instructions, 600, defaultModifiers());
  expect(resAndPopHistory[599]).toMatchInlineSnapshot(`
    Object {
      "food": 172.19999999999885,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 0,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "start": 0,
        "type": "walk",
      },
      Object {
        "start": 19,
        "type": "walk",
      },
      Object {
        "start": 43,
        "type": "kill",
      },
      Object {
        "start": 89,
        "type": "walk",
      },
      Object {
        "start": 93,
        "type": "gather",
      },
      Object {
        "start": 514,
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
  const {resAndPopHistory, entities} = simulateGame(instructions, 200, defaultModifiers());
  expect(resAndPopHistory[199]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 0,
      "maxPopSpace": 5,
      "popSpace": 1,
      "stone": 0,
      "wood": 0.2517985611511371,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 96,
        "type": "walk",
      },
      Object {
        "start": 104,
        "type": "build",
      },
      Object {
        "start": 129,
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
        {type: "gather", resId: "strgl", until: {type: "event", name: "constructionAdded-h1"}},
        {type: "build", building: "house", distance: 4, id: "h1"},
      ],
      tc: [
        {type: "wait", until: {type: "buildRes", entity: "villager"}},
        {type: "train", unit: "villager", id: `v2`},
      ],
    },
  };
  const {resAndPopHistory, entities} = simulateGame(instructions, 300, defaultModifiers());
  expect(resAndPopHistory[299]).toMatchInlineSnapshot(`
    Object {
      "food": 8.409999999999826,
      "gold": 0,
      "maxPopSpace": 10,
      "popSpace": 2,
      "stone": 0,
      "wood": 0.49946558825924026,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 232,
        "type": "walk",
      },
      Object {
        "start": 240,
        "type": "build",
      },
      Object {
        "start": 257,
        "type": "wait",
      },
    ]
  `);
  expect(entities.v2.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 233,
        "type": "walk",
      },
      Object {
        "start": 241,
        "type": "build",
      },
      Object {
        "start": 257,
        "type": "wait",
      },
    ]
  `);
  expect(entities.tc.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
      v1: [
        {
          type: "gather",
          resId: "gold",
          until: {type: "researchAt", technology: "loom", percentDone: 100},
        },
      ],
      tc: [
        {type: "wait", until: {type: "buildRes", entity: "loom"}},
        {type: "research", technology: "loom"},
      ],
    },
  };
  const {resAndPopHistory, entities} = simulateGame(instructions, 300, defaultModifiers());
  expect(resAndPopHistory[299]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 6.99999999999984,
      "maxPopSpace": 5,
      "popSpace": 1,
      "stone": 0,
      "wood": 0,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 213,
        "type": "wait",
      },
    ]
  `);
  expect(entities.tc.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "start": 0,
        "type": "wait",
      },
      Object {
        "start": 188,
        "type": "research",
      },
      Object {
        "start": 213,
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
      v1: [
        {type: "build", building: "lumberCamp", atRes: "wood"},
        {type: "gather", resId: "wood"},
      ],
    },
  };
  const {resAndPopHistory, entities} = simulateGame(instructions, 200, defaultModifiers());
  expect(resAndPopHistory[199]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 52.236902050113706,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
  const {resAndPopHistory, entities} = simulateGame(instructions, 10, defaultModifiers());
  expect(resAndPopHistory[9]).toMatchInlineSnapshot(`
    Object {
      "food": 0,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 75,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
      v1: [
        {type: "build", building: "farm", id: "f1", distance: 0},
        {type: "gather", resId: "f1"},
      ],
    },
  };
  const {resAndPopHistory, entities} = simulateGame(instructions, 100, defaultModifiers());
  expect(resAndPopHistory[99]).toMatchInlineSnapshot(`
    Object {
      "food": 28.058823529411733,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 40,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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

test("rebuild a farm if it's empty", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, wood: 120},
    resPatches: {},
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [
        {type: "build", building: "farm", id: "f1", distance: 0},
        {type: "gather", resId: "f1"},
      ],
    },
  };
  const {resAndPopHistory, entities} = simulateGame(instructions, 600, defaultModifiers());
  expect(resAndPopHistory[599]).toMatchInlineSnapshot(`
    Object {
      "food": 194.74509803921498,
      "gold": 0,
      "maxPopSpace": 0,
      "popSpace": 1,
      "stone": 0,
      "wood": 0,
    }
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
      Object {
        "start": 524,
        "type": "walk",
      },
      Object {
        "start": 527,
        "type": "build",
      },
      Object {
        "start": 542,
        "type": "gather",
      },
    ]
  `);
});

test("condition fulfilled while walking to target", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, food: 45},
    resPatches: {
      sheep: {type: "sheep", count: 2, distance: 0},
      wood: {type: "wood", distance: 100},
    },
    entities: {
      v1: {type: "villager"},
      v2: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "sheep"}],
      v2: [{type: "gather", resId: "wood", until: {type: "buildRes", entity: "villager"}}],
    },
  };
  const {entities} = simulateGame(instructions, 100, defaultModifiers());
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
  expect(entities.v2.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "start": 0,
        "type": "walk",
      },
      Object {
        "start": 19,
        "type": "wait",
      },
    ]
  `);
});

test("react to researchAt event", () => {
  const instructions: Instructions = {
    startingRes: {...nullRes, food: 490},
    resPatches: {
      sheep: {type: "sheep", count: 10, distance: 0},
    },
    entities: {
      v1: {type: "villager"},
      v2: {type: "villager"},
      v3: {type: "villager"},
      tc: {type: "townCenter"},
    },
    tasks: {
      tc: [
        {type: "wait", until: {type: "buildRes", entity: "feudalAge"}},
        {type: "research", technology: "feudalAge"},
      ],
      v1: [
        {
          type: "gather",
          resId: "sheep",
          until: {type: "researchAt", percentDone: 0, technology: "feudalAge"},
        },
      ],
      v2: [
        {
          type: "gather",
          resId: "sheep",
          until: {type: "researchAt", percentDone: 35, technology: "feudalAge"},
        },
      ],
      v3: [
        {
          type: "gather",
          resId: "sheep",
          until: {type: "researchAt", percentDone: 100, technology: "feudalAge"},
        },
      ],
    },
  };
  const {entities} = simulateGame(instructions, 200, defaultModifiers());
  expect(entities.tc.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "start": 0,
        "type": "wait",
      },
      Object {
        "start": 14,
        "type": "research",
      },
      Object {
        "start": 144,
        "type": "wait",
      },
    ]
  `);
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 15,
        "type": "wait",
      },
    ]
  `);
  expect(entities.v2.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 60,
        "type": "wait",
      },
    ]
  `);
  expect(entities.v3.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 144,
        "type": "wait",
      },
    ]
  `);
});

test("wood collection faster with double-bit-axe", () => {
  const instructions1: Instructions = {
    startingRes: nullRes,
    resPatches: {
      woodline: {type: "wood", distance: 1},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "woodline"}],
    },
  };
  const sim1 = simulateGame(instructions1, 200, defaultModifiers());
  expect(sim1.resAndPopHistory[199].wood).toMatchInlineSnapshot(`69.64920273348484`);

  const instructions2: Instructions = {
    startingRes: {...nullRes, food: 100, wood: 50},
    resPatches: {
      woodline: {type: "wood", distance: 1},
    },
    entities: {
      v1: {type: "villager"},
      lumercamp: {type: "lumberCamp"},
    },
    tasks: {
      v1: [{type: "gather", resId: "woodline"}],
      lumercamp: [{type: "research", technology: "doubleBitAxe"}],
    },
  };
  const sim2 = simulateGame(instructions2, 200, defaultModifiers());
  expect(sim2.resAndPopHistory[199].wood).toMatchInlineSnapshot(`80.78381117661829`);
});

test("farm and wood collection faster with wheelbarrow", () => {
  const instructions1: Instructions = {
    startingRes: nullRes,
    resPatches: {
      farm: {type: "farm", distance: 1},
      woodline: {type: "wood", distance: 5},
    },
    entities: {
      v1: {type: "villager"},
      v2: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "farm"}],
      v2: [{type: "gather", resId: "woodline"}],
    },
  };
  const sim1 = simulateGame(instructions1, 200, defaultModifiers());
  expect(sim1.resAndPopHistory[199].food).toMatchInlineSnapshot(`62.48421052631591`);
  expect(sim1.resAndPopHistory[199].wood).toMatchInlineSnapshot(`50.339495798319234`);

  const instructions2: Instructions = {
    startingRes: {...nullRes, food: 175, wood: 50},
    resPatches: {
      farm: {type: "farm", distance: 1},
      woodline: {type: "wood", distance: 5},
    },
    entities: {
      v1: {type: "villager"},
      v2: {type: "villager"},
      tc: {type: "townCenter"},
    },
    tasks: {
      v1: [{type: "gather", resId: "farm"}],
      v2: [{type: "gather", resId: "woodline"}],
      tc: [{type: "research", technology: "wheelbarrow"}],
    },
  };
  const sim2 = simulateGame(instructions2, 200, defaultModifiers());
  expect(sim2.resAndPopHistory[199].food).toMatchInlineSnapshot(`67.34317542322088`);
  expect(sim2.resAndPopHistory[199].wood).toMatchInlineSnapshot(`53.55631944052799`);
});

test("researchAt still works if research has been done", () => {
  const instructions1: Instructions = {
    startingRes: {...nullRes, food: 100, wood: 50},
    resPatches: {
      sheep: {type: "sheep", distance: 0, count: 1},
      woodline: {type: "wood", distance: 5},
    },
    entities: {
      v1: {type: "villager"},
      lumercamp: {type: "lumberCamp"},
    },
    tasks: {
      v1: [
        {type: "gather", resId: "sheep"},
        {
          type: "gather",
          resId: "woodline",
          until: {type: "researchAt", technology: "doubleBitAxe", percentDone: 50},
        },
      ],
      lumercamp: [{type: "research", technology: "doubleBitAxe"}],
    },
  };
  const {entities} = simulateGame(instructions1, 200, defaultModifiers());
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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

test("if two conditions wait for res, only yield it for the first", () => {
  const instructions1: Instructions = {
    startingRes: {...nullRes, wood: 20},
    resPatches: {
      woodline: {type: "wood", distance: 1},
    },
    entities: {
      v1: {type: "villager"},
      v2: {type: "villager"},
      v3: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "woodline"}],
      v2: [
        {type: "wait", until: {type: "buildRes", entity: "house"}},
        {
          type: "build",
          building: "house",
          distance: 2,
        },
      ],
      v3: [
        {type: "wait", until: {type: "buildRes", entity: "house"}},
        {
          type: "build",
          building: "house",
          distance: 2,
        },
      ],
    },
  };
  const {entities} = simulateGame(instructions1, 200, defaultModifiers());
  expect(entities.v2.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "start": 0,
        "type": "wait",
      },
      Object {
        "start": 18,
        "type": "walk",
      },
      Object {
        "start": 23,
        "type": "build",
      },
      Object {
        "start": 48,
        "type": "wait",
      },
    ]
  `);
  expect(entities.v3.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "start": 0,
        "type": "wait",
      },
      Object {
        "start": 88,
        "type": "walk",
      },
      Object {
        "start": 93,
        "type": "build",
      },
      Object {
        "start": 118,
        "type": "wait",
      },
    ]
  `);
});

test("switch from one gathering source to the next with distance 0 incurs a delay", () => {
  const instructions: Instructions = {
    startingRes: nullRes,
    resPatches: {
      boar1: {type: "boar", distance: 0},
      sheep: {type: "sheep", count: 1, distance: 0},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [
        {type: "gather", resId: "boar1"},
        {type: "gather", resId: "sheep"},
      ],
    },
  };
  const {entities} = simulateGame(instructions, 500, defaultModifiers());
  expect(entities.v1.steps.map((s) => ({type: s.desc.type, start: s.start})))
    .toMatchInlineSnapshot(`
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
        "start": 424,
        "type": "walk",
      },
      Object {
        "start": 427,
        "type": "gather",
      },
    ]
  `);
});

test("crowded ressources are being punished", () => {
  const instructions1: Instructions = {
    startingRes: nullRes,
    resPatches: {
      woodline: {type: "wood", distance: 1},
    },
    entities: {
      v1: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "woodline"}],
    },
  };
  const sim1 = simulateGame(instructions1, 200, defaultModifiers());
  expect(sim1.resAndPopHistory[199].wood).toMatchInlineSnapshot(`69.64920273348484`);

  const instructions2: Instructions = {
    ...instructions1,
    entities: {
      ...instructions1.entities,
      v2: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "woodline"}],
      v2: [{type: "gather", resId: "woodline"}],
    },
  };

  const sim2 = simulateGame(instructions2, 200, defaultModifiers());
  expect(sim2.resAndPopHistory[199].wood).toMatchInlineSnapshot(`133.37404580152764`);

  const instructions3: Instructions = {
    ...instructions2,
    entities: {
      ...instructions2.entities,
      v3: {type: "villager"},
    },
    tasks: {
      v1: [{type: "gather", resId: "woodline"}],
      v2: [{type: "gather", resId: "woodline"}],
      v3: [{type: "gather", resId: "woodline"}],
    },
  };
  const sim3 = simulateGame(instructions3, 200, defaultModifiers());
  expect(sim3.resAndPopHistory[199].wood).toMatchInlineSnapshot(`195.89535504538014`);
});
