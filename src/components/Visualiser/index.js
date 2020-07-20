import React from "react";
import css from "@emotion/css";
import {createArrayWith} from "../../lib/range";
import {simulateGame} from "../../simulator";
import {Col, Row} from "../../style/layout";
import {formatTime} from "../../lib/format";
import {Text} from "../../style/text";
import {colors} from "../../style/tokens";
import Header from "./Header";
import mq from "../../style/media-queries";
import DetailView from "./DetailView/DetailView";
import CompactView from "./CompactView/CompactView";

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
  const labels = createArrayWith(Math.ceil(totalSeconds / 30), (i) => i * 30);
  return (
    <Col css={{[mq.mobile]: {display: "none"}}}>
      <div css={{height: bufferFromStart}} />
      <div css={{position: "relative", height: totalSeconds * pixelsPerSecond, width: "2.5rem"}}>
        {labels.map((label) => (
          <div key={label} css={{position: "absolute", top: label * pixelsPerSecond, left: 0}}>
            <Text size="xxs" lineHeight="none" color="gray_400" css={{marginTop: "-0.6em"}}>
              {formatTime(label)}
            </Text>
          </div>
        ))}
      </div>
    </Col>
  );
};

const bufferFromStart = 100;

const timeIndicatorContainerStyle = css({
  position: "sticky",
  top: bufferFromStart,
  zIndex: 2,
});

const timeIndicatorStyle = css({
  position: "absolute",
  top: 0,
  left: 0,
  width: ["96vw", "calc(100vw - 1rem)"],
  borderBottom: `1px solid ${colors.white_a10}`,
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
  <div css={timeIndicatorContainerStyle}>
    <div css={timeIndicatorStyle}>
      <div css={timeIndicatorArrowStyle} />
    </div>
  </div>
);

const Visualiser = ({instructions, duration: totalDuration, allAgeModifiers}) => {
  const containerRef = React.useRef();
  const scrollPos = useRelativePosition(containerRef);

  const {resAndPopHistory, entities} = React.useMemo(
    () => simulateGame(instructions, totalDuration, allAgeModifiers),
    [instructions, totalDuration, allAgeModifiers]
  );

  const pixelsPerSecond = 2;

  const currentTime =
    scrollPos === null
      ? 0
      : Math.min(
          totalDuration - 1,
          Math.max(0, Math.round((-scrollPos + bufferFromStart) / pixelsPerSecond))
        );

  const currentRes = resAndPopHistory[currentTime];

  const [showDetailView, setShowDetailView] = React.useState(false);
  const ViewComp = showDetailView ? DetailView : CompactView;

  return (
    <Col sp={3}>
      <div>
        <button onClick={() => setShowDetailView(!showDetailView)}>
          Show {showDetailView ? "Compact" : "Detail"} View
        </button>
      </div>
      <Col css={{position: "relative"}} bg="gray_700">
        <Header time={currentTime} res={currentRes} />
        <Col css={{position: "relative"}} px={1}>
          <Row>
            <Col>
              <div css={{height: bufferFromStart}} />
              <div css={{position: "relative", flex: "auto"}} ref={containerRef}>
                <TimeIndicator />
              </div>
            </Col>
            <Timeline totalSeconds={totalDuration - 1} pixelsPerSecond={pixelsPerSecond} />
            <ViewComp
              entities={entities}
              totalDuration={totalDuration}
              pixelsPerSecond={pixelsPerSecond}
              bufferFromStart={bufferFromStart}
            />
          </Row>
        </Col>
        <div css={{height: "100vh"}} />
      </Col>
    </Col>
  );
};

export default Visualiser;
