import React from "react";
import ResizeObserver from "resize-observer-polyfill";

export const useMeasureWithNode = (node, opts = {}) => {
  const [bounds, setBounds] = React.useState(null);

  React.useLayoutEffect(() => {
    if (!node) return;
    const updateBounds = () => {
      const rect = node.getBoundingClientRect();
      const {top, bottom, left, right, height, width} = rect;
      setBounds((prev) => {
        if (
          !prev ||
          prev.top !== top ||
          prev.bottom !== bottom ||
          prev.left !== left ||
          prev.right !== right
        ) {
          return {top, bottom, left, right, height, width};
        } else {
          return prev;
        }
      });
    };
    const ro = new ResizeObserver(updateBounds);
    ro.observe(node);
    updateBounds();
    return () => ro.disconnect();
  }, [node, opts.excludePadding]);

  return bounds;
};

export const useMeasure = (opts) => {
  const [node, setNode] = React.useState();
  return [useMeasureWithNode(node, opts), setNode];
};
