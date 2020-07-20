import React from "react";
import css from "@emotion/css";
import {allEntities} from "../../simulator/entities";

const hashToInt = (val) => {
  let hash = 0;
  if (val.length === 0) return hash;
  for (let i = 0; i < val.length; i++) {
    let chr = val.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

export const getIcon = (entity, id) => {
  const {icon: rawIcon} = allEntities[entity];
  return Array.isArray(rawIcon) ? rawIcon[hashToInt(id) % rawIcon.length] : rawIcon;
};

const topStyle = css({position: "sticky", top: "2.8rem", zIndex: 1});
const topInnerStyle = css({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
});
const topIconStyle = css({display: "block", width: "100%"});

export const ColTop = ({type, id}) => (
  <div css={topStyle}>
    <div css={topInnerStyle}>
      <img src={getIcon(type, id)} alt={type} title={type} css={topIconStyle} />
    </div>
  </div>
);
