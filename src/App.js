import React from "react";
import {Col} from "./style/layout";
import {Text} from "./style/text";
import Visualiser from "./components/Visualiser";
import {getDefaultModifiers} from "./simulator/defaultModifiers";
import "./simulator/civs";
import scoutCiceroInstructions from "./instructions/scouts-cicero";

const App = () => (
  <Col>
    <Text as="h1" size="xxl" weight="bold">
      Build Orders
    </Text>
    <Visualiser
      instructions={scoutCiceroInstructions}
      duration={1000}
      allAgeModifiers={getDefaultModifiers()}
    />
  </Col>
);

export default App;
