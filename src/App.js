import React from "react";
import {createArrayWith} from "./lib/range";
import {taskInfo} from "./lib/info";
import {calcRessources} from "./lib/calc-ressources";

function getNodePosition(node) {
  if (!node) return null;
  return node.getBoundingClientRect().top;
}

export function useRelativePosition(nodeRef) {
  const [position, setNodePosition] = React.useState(null);
  React.useEffect(() => {
    setNodePosition(getNodePosition(nodeRef.current));
    let requestRunning = null;
    function handleScroll() {
      if (requestRunning === null) {
        requestRunning = window.requestAnimationFrame(() => {
          setNodePosition(getNodePosition(nodeRef.current));
          requestRunning = null;
        });
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nodeRef]);
  return position;
}

const Timeline = ({totalSeconds, pixelsPerSecond}) => {
  const labels = createArrayWith(Math.ceil(totalSeconds / 30), i => i * 30);
  return (
    <div css={{position: "relative", height: totalSeconds * pixelsPerSecond, width: "2em"}}>
      {labels.map(label => (
        <div css={{position: "absolute", top: label * pixelsPerSecond, left: 0}}>{label}</div>
      ))}
    </div>
  );
};

const Task = ({task, pixelsPerSecond}) => {
  const {start, duration, type, meta} = task;
  const info = taskInfo[type];
  return (
    <div css={{height: duration * pixelsPerSecond, backgroundColor: info.color, color: "white"}}>
      {type.slice(0, 1)}
    </div>
  );
};

const Entity = ({entity, pixelsPerSecond}) => {
  const {type, createdAt, tasks} = entity;
  return (
    <div css={{display: "flex", flexDirection: "column", marginRight: "0.25rem"}}>
      {createdAt > 0 && <div css={{height: createdAt * pixelsPerSecond}} />}
      <div
        css={{
          flex: "auto",
          backgroundColor: "yellow",
          position: "relative",
          width: "1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div css={{position: "sticky", top: 38}}>
          <div css={{position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "cyan"}}>
            {type.slice(0, 1)}
          </div>
        </div>
        {tasks.map((task, i) => (
          <Task key={i} task={task} pixelsPerSecond={pixelsPerSecond} />
        ))}
      </div>
    </div>
  );
};

const buildingDuration = (n, origDuration) => Math.ceil((3 * origDuration) / (n + 2));

const entities = [
  {
    id: 1,
    type: "towncenter",
    createdAt: 0,
    createdBy: null,
    tasks: [
      {start: 0, duration: 25, type: "create", meta: {createType: "villager"}},
      {start: 25, duration: 25, type: "create", meta: {createType: "villager"}},
      {start: 50, duration: 25, type: "create", meta: {createType: "villager"}},
      {start: 75, duration: 25, type: "create", meta: {createType: "villager"}},
      {start: 100, duration: 25, type: "create", meta: {createType: "villager"}},
    ],
  },
  {
    id: 2,
    type: "villager",
    createdAt: 0,
    createdBy: 213,
    tasks: [
      {start: 0, duration: 5, type: "walk"},
      {
        start: 5,
        duration: buildingDuration(2, 25),
        type: "build",
        meta: {builders: 2, buildingType: "house"},
      },
      {start: 5 + 19, duration: 15, type: "walk"},
      {start: 5 + 19 + 15, duration: 240, type: "eat", meta: {foodType: "sheep"}},
    ],
  },
  {
    id: 3,
    type: "villager",
    createdAt: 0,
    createdBy: null,
    tasks: [
      {start: 0, duration: 5, type: "walk"},
      {
        start: 5,
        duration: buildingDuration(2, 25),
        type: "build",
        meta: {builders: 2, buildingType: "house"},
      },
      {start: 5 + 19, duration: 15, type: "walk"},
      {start: 5 + 19 + 15, duration: 240, type: "eat", meta: {foodType: "sheep"}},
    ],
  },
  {
    id: 4,
    type: "villager",
    createdAt: 0,
    createdBy: null,
    tasks: [
      {start: 0, duration: 5, type: "walk"},
      {
        start: 5,
        duration: buildingDuration(1, 25),
        type: "build",
        meta: {builders: 1, buildingType: "house"},
      },
      {start: 5 + 25, duration: 25, type: "walk"},
      {start: 5 + 25 + 25, duration: 240, type: "eat", meta: {foodType: "sheep"}},
    ],
  },
  {
    id: 5,
    type: "villager",
    createdAt: 25,
    createdBy: 1,
    tasks: [
      {start: 25, duration: 5, type: "walk"},
      {start: 25 + 5, duration: 240, type: "eat", meta: {foodType: "sheep"}},
    ],
  },
  {
    id: 6,
    type: "villager",
    createdAt: 50,
    createdBy: 1,
    tasks: [
      {start: 50, duration: 5, type: "walk"},
      {start: 50 + 5, duration: 240, type: "eat", meta: {foodType: "sheep"}},
    ],
  },
  {
    id: 7,
    type: "villager",
    createdAt: 75,
    createdBy: 1,
    tasks: [
      {start: 75, duration: 5, type: "walk"},
      {start: 75 + 5, duration: 240, type: "eat", meta: {foodType: "sheep"}},
    ],
  },
  {
    id: 8,
    type: "villager",
    createdAt: 100,
    createdBy: 1,
    tasks: [
      {start: 100, duration: 15, type: "walk"},
      {
        start: 100 + 15,
        duration: 35,
        type: "build",
        meta: {builders: 1, buildingType: "lumbercamp"},
      },
      {start: 100 + 15 + 35, duration: 200, type: "wood"},
    ],
  },
  {
    id: 9,
    type: "villager",
    createdAt: 125,
    createdBy: 1,
    tasks: [
      {start: 125, duration: 15, type: "walk"},
      {start: 125 + 15, duration: 200 - 35, type: "wood"},
    ],
  },
];

const resTypes = ["food", "wood", "gold", "stone"];

const totalDuration = 360;

const resBySecond = calcRessources(
  entities,
  {
    food: 200,
    wood: 200,
    gold: 100,
    stone: 200,
  },
  totalDuration
);

const App = () => {
  const containerRef = React.useRef();
  const scrollPos = useRelativePosition(containerRef);

  const pixelsPerSecond = 2;
  const bufferFromStart = 100;

  const currentTime =
    scrollPos === null
      ? 0
      : Math.min(
          totalDuration,
          Math.max(0, Math.round((-scrollPos + bufferFromStart) / pixelsPerSecond))
        );

  const currentRes = resBySecond[currentTime];

  return (
    <div>
      <h1>Build Orders</h1>
      <div css={{position: "relative", border: "1px solid blue"}}>
        <div
          css={{
            position: "sticky",
            top: 0,
            border: "1px solid yellow",
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <div>
            <span>time: {currentTime} </span>
            {resTypes.map(type => (
              <span>
                | {type}: {Math.floor(currentRes[type])}{" "}
              </span>
            ))}
          </div>
        </div>
        <div css={{height: bufferFromStart}} />
        <div css={{position: "relative", border: "1px solid blue"}} ref={containerRef}>
          <div
            css={{
              position: "sticky",
              top: bufferFromStart,
              borderBottom: "1px dotted red",
            }}
          />
          <div css={{display: "flex"}}>
            <Timeline totalSeconds={totalDuration} pixelsPerSecond={pixelsPerSecond} />
            {entities.map(entity => (
              <Entity key={entity.id} entity={entity} pixelsPerSecond={pixelsPerSecond} />
            ))}
          </div>
        </div>
        <div css={{height: "100vh"}} />
      </div>
    </div>
  );
};

export default App;
