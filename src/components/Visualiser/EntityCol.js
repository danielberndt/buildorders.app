import React from "react";
import {taskInfo} from "../../simulator/info";
import {allEntities} from "../../simulator/entities";
import css from "@emotion/css";
import {Col} from "../../style/layout";
import {Text} from "../../style/text";

const Step = ({step, duration, pixelsPerSecond}) => {
  const {desc} = step;
  const info = (desc.type === "gather" ? taskInfo[desc.activity] : taskInfo[desc.type]) || {};
  return (
    <div css={{height: duration * pixelsPerSecond, backgroundColor: info.color, color: "white"}}>
      {desc.type.slice(0, 1)}
    </div>
  );
};

const topStyle = css({position: "sticky", top: "2.8rem"});
const topInnerStyle = css({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "1rem",
  backgroundSize: "cover",
});

const hashToInt = val => {
  let hash = 0;
  if (val.length === 0) return hash;
  for (let i = 0; i < val.length; i++) {
    let chr = val.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const Top = ({type, id}) => {
  const {icon: rawIcon} = allEntities[type];
  const icon = Array.isArray(rawIcon) ? rawIcon[hashToInt(id) % rawIcon.length] : rawIcon;
  return (
    <div css={topStyle}>
      <Col css={topInnerStyle} style={{backgroundImage: `url(${icon})`}} />
    </div>
  );
};

const EntityCol = ({entity, pixelsPerSecond, totalDuration}) => {
  const {type, createdAt, id, steps} = entity;
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
        <Top type={type} id={id} />
        {steps.map((step, i) => {
          const duration = (i + 1 < steps.length ? steps[i + 1].start : totalDuration) - step.start;
          return <Step key={i} step={step} pixelsPerSecond={pixelsPerSecond} duration={duration} />;
        })}
      </div>
    </div>
  );
};

export default EntityCol;
