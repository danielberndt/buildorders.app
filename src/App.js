import React from "react";
import {createArrayWith} from "./lib/range";
import {taskInfo} from "./lib/info";
import {simulateGame} from "./lib/simulator";
import {getDefaultModifiers} from "./lib/defaultModifiers";
import scoutInstructions from "./instructions/scouts";

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
        <div key={label} css={{position: "absolute", top: label * pixelsPerSecond, left: 0}}>
          {label}
        </div>
      ))}
    </div>
  );
};

const Step = ({step, duration, pixelsPerSecond}) => {
  const {desc} = step;
  const info = (desc.type === "gather" ? taskInfo[desc.activity] : taskInfo[desc.type]) || {};
  return (
    <div css={{height: duration * pixelsPerSecond, backgroundColor: info.color, color: "white"}}>
      {desc.type.slice(0, 1)}
    </div>
  );
};

const Entity = ({entity, pixelsPerSecond, totalDuration}) => {
  const {type, createdAt, steps} = entity;
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
        {steps.map((step, i) => {
          const duration = (i + 1 < steps.length ? steps[i + 1].start : totalDuration) - step.start;
          return <Step key={i} step={step} pixelsPerSecond={pixelsPerSecond} duration={duration} />;
        })}
      </div>
    </div>
  );
};

const resTypes = ["food", "wood", "gold", "stone"];

const totalDuration = 700;

const {resHistory, entities} = simulateGame(
  scoutInstructions,
  totalDuration,
  getDefaultModifiers().darkAge
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
          totalDuration - 1,
          Math.max(0, Math.round((-scrollPos + bufferFromStart) / pixelsPerSecond))
        );

  const currentRes = resHistory[currentTime];

  return (
    <div>
      <h1>Build Orders</h1>
      <div css={{position: "relative", border: "1px solid blue"}}>
        <div
          css={{
            position: "sticky",
            top: 0,
            border: "1px solid yellow",
            backgroundColor: "#222",
            zIndex: 1,
          }}
        >
          <div>
            <span>time: {currentTime} </span>
            {resTypes.map(type => (
              <span key={type}>
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
            <Timeline totalSeconds={totalDuration - 1} pixelsPerSecond={pixelsPerSecond} />
            {React.useMemo(
              () =>
                Object.values(entities)
                  .filter(entity => entity.steps.some(s => s.desc.type !== "wait"))
                  .map(entity => (
                    <Entity
                      key={entity.id}
                      entity={entity}
                      pixelsPerSecond={pixelsPerSecond}
                      totalDuration={totalDuration}
                    />
                  )),
              [entities, totalDuration, pixelsPerSecond]
            )}
          </div>
        </div>
        <div css={{height: "100vh"}} />
      </div>
    </div>
  );
};

export default App;
