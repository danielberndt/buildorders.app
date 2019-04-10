import {calcRessources} from "../calc-ressources";

const nullStart = {wood: 0, food: 0, gold: 0, stone: 0};

const foodVill = ({id, duration = 100, foodType = "sheep"}) => ({
  id,
  type: "villager",
  createdAt: 0,
  createdBy: null,
  tasks: [{start: 0, duration, type: "eat", meta: {foodType}}],
});

test("null case", () => {
  expect(calcRessources([], nullStart, 10)[10]).toMatchInlineSnapshot(`
Object {
  "food": 0,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one sheep vil", () => {
  const entities = [foodVill({id: 1, duration: 10})];
  expect(calcRessources(entities, nullStart, 10)[10]).toMatchInlineSnapshot(`
Object {
  "food": 3.3000000000000003,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});

test("one sheep vil works longer than simulated", () => {
  const entities = [foodVill({id: 1, duration: 100})];
  expect(calcRessources(entities, nullStart, 10)[10]).toMatchInlineSnapshot(`
Object {
  "food": 3.3000000000000003,
  "gold": 0,
  "stone": 0,
  "wood": 0,
}
`);
});
