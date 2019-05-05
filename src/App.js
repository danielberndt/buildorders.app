import React from "react";
import {Col} from "./style/layout";
import {Text} from "./style/text";
import Visualiser from "./components/Visualiser";
import scoutInstructions from "./instructions/scouts";
import {getDefaultModifiers} from "./simulator/defaultModifiers";
import "./simulator/civs";

const App = () => (
  <Col>
    <Text as="h1" size="xxl" weight="bold">
      Build Orders
    </Text>
    <Visualiser
      instructions={scoutInstructions}
      duration={700}
      allAgeModifiers={getDefaultModifiers()}
    />
  </Col>
);

export default App;
