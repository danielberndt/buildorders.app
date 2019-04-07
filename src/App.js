import React from "react";
import {createArrayWith} from "./lib/range";
import {blue} from "ansi-colors";

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

const Entity = ({label, creationTime, pixelsPerSecond}) => (
  <div css={{display: "flex", flexDirection: "column", marginRight: "0.25rem"}}>
    {creationTime > 0 && <div css={{height: creationTime * pixelsPerSecond}} />}
    <div css={{flex: "auto", backgroundColor: "yellow", position: "relative", width: "1rem"}}>
      <div css={{position: "sticky", top: 38}}>
        <div css={{position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "cyan"}}>
          {label}
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const containerRef = React.useRef();
  const scrollPos = useRelativePosition(containerRef);

  const pixelsPerSecond = 2;
  const bufferFromStart = 100;

  const currentTime =
    scrollPos === null
      ? 0
      : Math.max(0, Math.round((-scrollPos + bufferFromStart) / pixelsPerSecond));

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
          <div>Food: 123 time: {currentTime}</div>
        </div>
        <div css={{height: bufferFromStart}} />
        <div css={{position: "relative", border: "1px solid blue"}} ref={containerRef}>
          <div
            css={{
              position: "sticky",
              top: 100,
              borderBottom: "1px dotted red",
            }}
          />
          <div css={{display: "flex"}}>
            <Timeline totalSeconds={360} pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={0} label="T" pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={0} label="V" pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={0} label="V" pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={0} label="V" pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={25} label="V" pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={50} label="V" pixelsPerSecond={pixelsPerSecond} />
            <Entity creationTime={75} label="V" pixelsPerSecond={pixelsPerSecond} />
          </div>
        </div>
        <div css={{height: "100vh"}} />
      </div>
    </div>
  );
};

export default App;
