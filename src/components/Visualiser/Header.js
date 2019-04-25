import React from "react";
import {css} from "@emotion/core";
import {Row} from "../../style/layout";
import {Text, textClasses} from "../../style/text";
import {formatTime} from "../../lib/format";

const resTypes = [
  {resName: "wood", icon: require("../../images/ui/res-wood.png")},
  {resName: "food", icon: require("../../images/ui/res-food.png")},
  {resName: "gold", icon: require("../../images/ui/res-gold.png")},
  {resName: "stone", icon: require("../../images/ui/res-stone.png")},
];

const numberBoxStyle = css([textClasses.textAlign.right, {minWidth: "2.5em"}]);

const NumberBox = ({children}) => <div css={numberBoxStyle}>{children}</div>;

const numberStyle = css({fontVariantNumeric: "tabular-nums"});

const Number = ({val, color = "gray_100"}) => (
  <Text size="xs" weight="bold" css={numberStyle} color={color}>
    {val}
  </Text>
);

const stickyStyle = css({
  position: "sticky",
  top: 0,
  zIndex: 2,
});

const iconStyle = css({
  display: "block",
  maxHeight: "1.3rem",
  width: "auto",
});

const ResBox = ({children, isBad}) => (
  <Row sp={1} align="center" bg={isBad ? "red_700" : "gray_900"} pa={0}>
    {children}
  </Row>
);

const Header = ({time, res}) => (
  <Row bg="gray_600" elevation={1} css={stickyStyle} sp={0} px={1} py={0} align="center">
    <Row sp={1} bg="gray_800" pa={0}>
      <NumberBox>
        <Number val={formatTime(time)} color="gray_300" />
      </NumberBox>
    </Row>
    {resTypes.map(({resName, icon}) => (
      <ResBox key={resName} isBad={res[resName] < 0}>
        <img width={24} height={13} src={icon} alt={resName} css={iconStyle} />
        <NumberBox>
          <Number val={Math.floor(res[resName])} />
        </NumberBox>
      </ResBox>
    ))}
    <ResBox isBad={res.popSpace > res.maxPopSpace}>
      <img
        width={24}
        height={13}
        src={require("../../images/ui/res-pop.png")}
        alt="pop space"
        css={iconStyle}
      />
      <Row sp={0} css={{minWidth: "3rem"}} justify="end">
        <Number val={Math.floor(res.popSpace)} />
        <Text size="xs" color="gray_300">
          /
        </Text>
        <Number val={Math.floor(res.maxPopSpace)} />
      </Row>
    </ResBox>
  </Row>
);

export default Header;
