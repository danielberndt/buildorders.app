import React from "react";
import {createArrayWith} from "./lib/range";
import {taskInfo} from "./simulator/info";
import {getDefaultModifiers} from "./simulator/defaultModifiers";
import {simulateGame} from "./simulator";
import scoutInstructions from "./instructions/scouts";
import VisHeader from "./components/VisHeader";
import {Col, Row} from "./style/layout";
import {formatTime} from "./lib/format";
import {Text} from "./style/text";
import css from "@emotion/css";
import {colors} from "./style/tokens";

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
    <div css={{position: "relative", height: totalSeconds * pixelsPerSecond, width: "2.5rem"}}>
      {labels.map(label => (
        <div key={label} css={{position: "absolute", top: label * pixelsPerSecond, left: 0}}>
          <Text size="xxs" lineHeight="none" css={{marginTop: "-0.6em"}}>
            {formatTime(label)}
          </Text>
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

const totalDuration = 700;
const bufferFromStart = 100;

const timeIndicatorStyle = css({
  position: "sticky",
  borderBottom: `1px solid ${colors.gray_600}`,
  top: bufferFromStart,
});

const timeIndicatorArrowStyle = css({
  position: "absolute",
  right: "100%",
  marginRight: "0.25rem",
  top: "-0.25rem",
  width: 0,
  height: 0,
  borderTop: "0.25rem solid transparent",
  borderBottom: "0.25rem solid transparent",
  borderLeft: `0.25rem solid ${colors.gray_500}`,
});

const TimeIndicator = () => (
  <div css={timeIndicatorStyle}>
    <div css={timeIndicatorArrowStyle} />
  </div>
);

const {resHistory, entities} = simulateGame(
  scoutInstructions,
  totalDuration,
  getDefaultModifiers().darkAge
);

const App = () => {
  const containerRef = React.useRef();
  const scrollPos = useRelativePosition(containerRef);

  const pixelsPerSecond = 2;

  const currentTime =
    scrollPos === null
      ? 0
      : Math.min(
          totalDuration - 1,
          Math.max(0, Math.round((-scrollPos + bufferFromStart) / pixelsPerSecond))
        );

  const currentRes = resHistory[currentTime];

  return (
    <Col>
      <Text as="h1" size="xxl" weight="bold">
        Build Orders
      </Text>
      <Col css={{position: "relative"}} bg="gray_700">
        <VisHeader time={currentTime} res={currentRes} />
        <div css={{height: bufferFromStart}} />
        <Col css={{position: "relative"}} ref={containerRef} px={1}>
          <TimeIndicator />
          <Row>
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
          </Row>
        </Col>
        <div css={{height: "100vh"}} />
      </Col>
    </Col>
  );
};

export default App;
