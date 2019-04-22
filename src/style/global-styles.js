import "normalize.css/normalize.css";
import {injectGlobal} from "emotion";
import tokens from "./tokens";

injectGlobal`
html {
  box-sizing: border-box;
  transition-duration: 0.15s;
  transition-timing-function: ease-out;
  background-size: cover;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  font-size: 1em;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/*
This rule determines what '1rem' refers to. On screens smaller than 30em it's always 1em = 16px
as defined in the html tag above.
On larger screens it is calculated as follows:
1em = 16px (if user has default browser settings)
0.88em = 14.08px
0.4vw = 0.4 * window.width / 100
At a window size of 30em (aka 480px) this results in:
0.88em + 0.4vw = 14.08px + 480px * 0.004 = 14.08px + 1.92px = 16px
For larger screen sizes this results in 1rem being greater than 16px.
*/

@media screen and (min-width: 30em) {
  html {
    font-size: calc(0.88em + 0.4vw);
  }
}

body {
  background-color: ${tokens.colors.gray_900};
  color: ${tokens.colors.gray_100};
}
`;
