import React from "react";
import css from "@emotion/css";
import {createArrayWith} from "../../lib/range";
import {simulateGame} from "../../simulator";
import {Col, Row} from "../../style/layout";
import {formatTime} from "../../lib/format";
import {Text} from "../../style/text";
import {colors} from "../../style/tokens";
import Header from "./Header";
import EntityCol from "./EntityCol";

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

const Visualiser = ({instructions, duration: totalDuration, modifiers}) => {
  const containerRef = React.useRef();
  const scrollPos = useRelativePosition(containerRef);

  const {resHistory, entities} = React.useMemo(
    () => simulateGame(instructions, totalDuration, modifiers),
    [instructions, totalDuration, modifiers]
  );

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
    <Col css={{position: "relative"}} bg="gray_700">
      <Header time={currentTime} res={currentRes} />
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
                  <EntityCol
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
  );
};

export default Visualiser;
