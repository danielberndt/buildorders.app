import { calcRessources } from "../calc-ressources";
import { getDefaultModifiers } from "../defaultModifiers";

const nullStart = { wood: 0, food: 0, gold: 0, stone: 0 };

const gatherVill = ({ id, duration = 100, type = "sheep", distance = 0 }) => ({
  id,
  type: "villager",
  createdAt: 0,
  createdBy: null,
  tasks: [{ start: 0, duration, type: "gather", meta: { type, distance } }]
});

test("null case", () => {
  expect(calcRessources([], nullStart, 10, getDefaultModifiers())[9])
    .toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one sheep vil", () => {
  const entities = [gatherVill({ id: 1, duration: 10 })];
  expect(calcRessources(entities, nullStart, 10, getDefaultModifiers())[9])
    .toMatchInlineSnapshot(`
Object {
  "food": 3.3000000000000003,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one sheep vil works longer than simulated", () => {
  const entities = [gatherVill({ id: 1, duration: 100 })];
  expect(calcRessources(entities, nullStart, 10, getDefaultModifiers())[9])
    .toMatchInlineSnapshot(`
Object {
  "food": 3.3000000000000003,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one sheep vil efficiency drop down", () => {
  const entities = [gatherVill({ id: 1, duration: 10, distance: 1 })];
  expect(calcRessources(entities, nullStart, 10, getDefaultModifiers())[9])
    .toMatchInlineSnapshot(`
Object {
  "food": 3.04849884526559,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one farmer for a minute", () => {
  const entities = [gatherVill({ id: 1, duration: 60, type: "farm" })];
  expect(calcRessources(entities, nullStart, 60, getDefaultModifiers())[59])
    .toMatchInlineSnapshot(`
Object {
  "food": 20.78431372549019,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one farmer for a minute with 1 distance", () => {
  const entities = [
    gatherVill({ id: 1, duration: 60, type: "farm", distance: 1 })
  ];
  expect(calcRessources(entities, nullStart, 60, getDefaultModifiers())[59])
    .toMatchInlineSnapshot(`
Object {
  "food": 19.127819548872203,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});
