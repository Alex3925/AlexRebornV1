import "tsconfig-paths/register";
import "@cassidy/jsx";

const item = (
  <>
    <f_bold>Test</f_bold>
    <standardLine></standardLine>
    <f_fancy>
      Holy Shit
      <br />
      No way
    </f_fancy>
  </>
);

const item2 = (
  <>
    <title font="bold">Hello</title>
    <content font="fancy">Hello mga baliw</content>
  </>
);

console.log(item2);
