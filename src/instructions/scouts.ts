import {createArrayWith} from "../lib/range";
import {Instructions, Task} from "../simulator/types";

const scoutInstructions: Instructions = {
  startingRes: {food: 200, wood: 200, gold: 100, stone: 200},
  resPatches: {
    berries: {type: "berries", count: 6, distance: 10},
    sheep: {type: "sheep", count: 8, distance: 0},
    deers: {type: "deer", count: 3, distance: 15},
    strgl: {type: "stragglers", count: 6, distance: 4},
    boar1: {type: "boar", distance: 15},
    boar2: {type: "boar", distance: 15},
    woodline1: {type: "wood", distance: 15},
    woodline2: {type: "wood", distance: 20},
    gold: {type: "gold", distance: 15},
    stone: {type: "stone", distance: 15},
  },
  entities: {
    tc: {type: "townCenter"},
    v1: {type: "villager"},
    v2: {type: "villager"},
    v3: {type: "villager"},
    scout: {type: "scoutCavalry"},
  },

  tasks: {
    v1: [
      {type: "build", building: "house", distance: 4, id: "h1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar1"}},
      {type: "gather", resId: "boar1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar2"}},
      {type: "gather", resId: "boar2"},
      {type: "gather", resId: "sheep"},
      {
        type: "gather",
        resId: "strgl",
        until: {type: "researchAt", technology: "horseCollar", percentDone: 50},
      },
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f3"},
      {type: "gather", resId: "f3"},
    ],
    v2: [
      {type: "build", building: "house", distance: 4, id: "h1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar1"}},
      {type: "gather", resId: "boar1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar2"}},
      {type: "gather", resId: "boar2"},
      {type: "gather", resId: "sheep"},
      {
        type: "gather",
        resId: "strgl",
        until: {type: "researchAt", technology: "horseCollar", percentDone: 50},
      },
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f4"},
      {type: "gather", resId: "f4"},
    ],
    v3: [
      {type: "build", building: "house", distance: 4, id: "h2"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar1"}},
      {type: "gather", resId: "boar1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar2"}},
      {type: "gather", resId: "boar2"},
      {type: "gather", resId: "sheep"},
      {
        type: "gather",
        resId: "strgl",
        until: {type: "researchAt", technology: "horseCollar", percentDone: 50},
      },
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f5"},
      {type: "gather", resId: "f5"},
    ],
    tc: [
      ...createArrayWith<Task>(22 - 4, (i) => ({type: "train", unit: "villager", id: `v${i + 4}`})),
      {type: "research", technology: "loom"},
      {type: "research", technology: "feudalAge"},
      ...createArrayWith<Task>(10, (i) => ({type: "train", unit: "villager", id: `v${i + 22}`})),
    ],
    v4: [
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar1"}},
      {type: "gather", resId: "boar1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar2"}},
      {type: "gather", resId: "boar2"},
      {
        type: "gather",
        resId: "sheep",
        until: {type: "researchAt", percentDone: 90, technology: "feudalAge"},
      },
      {type: "build", building: "stable", distance: 10, id: "stable"},
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f6"},
      {type: "gather", resId: "f6"},
    ],
    v5: [
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar1"}},
      {type: "gather", resId: "boar1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar2"}},
      {type: "gather", resId: "boar2"},
      {
        type: "gather",
        resId: "sheep",
        until: {type: "researchAt", percentDone: 50, technology: "feudalAge"},
      },
      {type: "build", building: "barracks", distance: 10},
      {type: "build", building: "stable", distance: 0, id: "stable"},
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f7"},
      {type: "gather", resId: "f7"},
    ],
    v6: [
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar1"}},
      {type: "gather", resId: "boar1"},
      {type: "gather", resId: "sheep", until: {type: "event", name: "lure_boar2"}},
      {type: "gather", resId: "boar2"},
      {
        type: "gather",
        resId: "sheep",
        until: {type: "researchAt", percentDone: 0, technology: "feudalAge"},
      },
      {type: "gather", resId: "woodline2"},
    ],
    v7: [
      {type: "build", building: "lumberCamp", atRes: "woodline1", id: "lumbercamp"},
      {type: "gather", resId: "woodline1"},
    ],
    v8: [{type: "gather", resId: "woodline1"}],
    v9: [{type: "gather", resId: "woodline1"}],

    v10: [
      {type: "lure", boarId: "boar1"},
      {type: "gather", resId: "boar1", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", id: "f1", distance: 0},
      {type: "gather", resId: "f1"},
    ],

    v11: [
      {type: "build", building: "house", distance: 8},
      {type: "gather", resId: "berries"},
    ],
    v12: [
      {type: "build", building: "mill", atRes: "berries", id: "mill"},
      {type: "gather", resId: "berries"},
    ],
    v13: [{type: "gather", resId: "berries"}],
    v14: [{type: "gather", resId: "berries"}],

    v15: [
      {type: "lure", boarId: "boar2"},
      {type: "gather", resId: "boar2", until: {type: "buildRes", entity: "farm"}},
      {type: "gather", resId: "sheep", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", id: "f2", distance: 0},
      {type: "gather", resId: "f2"},
    ],
    v16: [
      {type: "build", building: "house", distance: 8},
      {type: "gather", resId: "boar2"},
      {
        type: "gather",
        resId: "sheep",
        until: {type: "researchAt", percentDone: 0, technology: "feudalAge"},
      },
      {type: "gather", resId: "woodline2"},
    ],
    v17: [
      {type: "gather", resId: "boar2"},
      {
        type: "gather",
        resId: "sheep",
        until: {type: "researchAt", percentDone: 0, technology: "feudalAge"},
      },
      {type: "gather", resId: "woodline2"},
    ],
    v18: [
      {type: "gather", resId: "boar2"},
      {
        type: "gather",
        resId: "sheep",
        until: {type: "researchAt", percentDone: 0, technology: "feudalAge"},
      },
      {type: "gather", resId: "woodline2"},
    ],

    v19: [{type: "gather", resId: "woodline1"}],
    v20: [{type: "gather", resId: "woodline1"}],
    v21: [
      {type: "build", building: "lumberCamp", atRes: "woodline2"},
      {type: "gather", resId: "woodline2"},
    ],

    v22: [
      {type: "build", building: "house", distance: 4},
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f11"},
      {type: "gather", resId: "f11"},
    ],
    v23: [
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f8"},
      {type: "gather", resId: "f8"},
    ],
    v24: [
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f9"},
      {type: "gather", resId: "f9"},
    ],
    v25: [
      {type: "gather", resId: "strgl", until: {type: "buildRes", entity: "farm"}},
      {type: "build", building: "farm", distance: 0, id: "f10"},
      {type: "gather", resId: "f10"},
    ],
    stable: [
      {type: "train", unit: "scoutCavalry"},
      {type: "train", unit: "scoutCavalry"},
      {type: "train", unit: "scoutCavalry"},
    ],
    lumbercamp: [
      {type: "wait", until: {type: "researchAt", percentDone: 100, technology: "feudalAge"}},
      {type: "wait", until: {type: "buildRes", entity: "doubleBitAxe"}},
      {type: "research", technology: "doubleBitAxe"},
    ],
    mill: [
      {type: "wait", until: {type: "researchAt", percentDone: 0, technology: "doubleBitAxe"}},
      {type: "wait", until: {type: "buildRes", entity: "horseCollar"}},
      {type: "research", technology: "horseCollar"},
    ],
  },
};

export default scoutInstructions;
