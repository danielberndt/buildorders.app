import React from "react";
import {colors} from "../style/tokens";
import {css} from "@emotion/core";
import {Row} from "../style/layout";
import {Text} from "../style/text";

const resTypes = [
  {resName: "wood", icon: require("../images/ui/res-wood.png")},
  {resName: "food", icon: require("../images/ui/res-food.png")},
  {resName: "gold", icon: require("../images/ui/res-gold.png")},
  {resName: "stone", icon: require("../images/ui/res-stone.png")},
];

const numberStyle = css({
  fontVariantNumeric: "tabular-nums",
  minWidth: "2.5em",
});

const Number = ({val}) => (
  <Text align="right" size="xs" weight="bold" css={numberStyle}>
    {val}
  </Text>
);

const stickyStyle = css({
  position: "sticky",
  top: 0,
  backgroundColor: colors.gray_800,
  zIndex: 1,
});

const iconStyle = css({
  display: "block",
  maxHeight: "1.3rem",
  width: "auto",
});

const VisHeader = ({time, res}) => (
  <Row bg="gray_800" elevation={1} css={stickyStyle} sp={4}>
    <Row sp={1}>
      <Number val={time} />
    </Row>
    {resTypes.map(({resName, icon}) => (
      <Row sp={1} key={res} align="center">
        <img width={24} height={13} src={icon} alt={resName} css={iconStyle} />
        <Number val={Math.floor(res[resName])} />
      </Row>
    ))}
  </Row>
);

export default VisHeader;
