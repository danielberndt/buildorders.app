import React from "react";
import {css} from "@emotion/core";
import tokens from "./tokens";
import {createClasses} from "./utils";

const classes = {
  paddingTop: createClasses("paddingTop", tokens.spacings),
  paddingBottom: createClasses("paddingBottom", tokens.spacings),
  paddingLeft: createClasses("paddingLeft", tokens.spacings),
  paddingRight: createClasses("paddingRight", tokens.spacings),
  flex: {auto: css({flex: "auto"})},

  alignItems: createClasses("alignItems", {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    baseline: "baseline",
  }),
  justifyContent: createClasses("justifyContent", {
    start: "flex-start",
    center: "center",
    end: "flex-end",
  }),

  backgroundColor: createClasses(["backgroundColor"], tokens.colors),
  shadows: createClasses("boxShadow", tokens.shadows),

  vertSpacing: createClasses("vertSpacing", tokens.spacings, (val) => ({
    [`> *:not(:last-child):not(.x-push)`]: {marginRight: `${val}rem`},
  })),
  horSpacing: createClasses("horSpacing", tokens.spacings, (val) => ({
    [`> *:not(:last-child):not(.x-push)`]: {marginBottom: `${val}rem`},
  })),
};

export const layoutClasses = classes;

const elevationToShadow = {1: "default", 2: "md", 3: "lg", 4: "xl", 5: "xxl"};

const propsToCss = (props) => {
  const {
    css: cssList = [],
    pa,
    px = pa,
    py = pa,
    pt = py,
    pl = px,
    pr = px,
    pb = py,
    bg,
    elevation,
    fillParent,
    as: _,
    ...rest
  } = props;
  if (pt !== null && pt !== undefined) cssList.push(classes.paddingTop[pt]);
  if (pb !== null && pb !== undefined) cssList.push(classes.paddingBottom[pb]);
  if (pl !== null && pl !== undefined) cssList.push(classes.paddingLeft[pl]);
  if (pr !== null && pr !== undefined) cssList.push(classes.paddingRight[pr]);
  if (bg) cssList.push(classes.backgroundColor[bg]);
  if (elevation) cssList.push(classes.shadows[elevationToShadow[elevation]]);
  if (fillParent) cssList.push(classes.flex.auto);

  return {css: cssList, ...rest};
};

export const Push = (props) => <div className="x-push" css={classes.flex.auto} {...props} />;

const rowClass = css({display: "flex", flexDirection: "row"});

const rowCss = (props) => {
  const {css: cssList = [], sp, align, justify, breaking, ...rest} = props;
  cssList.push(rowClass);
  if (sp !== undefined && sp !== null) cssList.push(classes.vertSpacing[sp]);
  if (breaking || breaking === 0) {
    cssList.push(classes.breakVertSpacing[typeof breaking === "number" ? breaking : sp]);
  }
  if (align) cssList.push(classes.alignItems[align]);
  if (justify) cssList.push(classes.justifyContent[justify]);
  return {css: cssList, ...rest};
};

export const Row = React.forwardRef((props, ref) => {
  const Comp = props.as || "div";
  return <Comp ref={ref} {...propsToCss(rowCss(props))} />;
});

const colClass = css({display: "flex", flexDirection: "column"});
const colCss = (props) => {
  const {css: cssList = [], sp, align, justify, ...rest} = props;
  cssList.push(colClass);
  if (sp !== undefined && sp !== null) cssList.push(classes.horSpacing[sp]);
  if (align) cssList.push(classes.alignItems[align]);
  if (justify) cssList.push(classes.justifyContent[justify]);
  return {css: cssList, ...rest};
};

export const Col = React.forwardRef((props, ref) => {
  const Comp = props.as || "div";
  return <Comp ref={ref} {...propsToCss(colCss(props))} />;
});
