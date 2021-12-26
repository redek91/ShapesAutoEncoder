import "./styles/index.scss";
import * as p5 from "p5";

const sketch = (s: p5) => {
  s.setup = () => {
    s.createCanvas(200, 200);
  };

  s.draw = () => {
    s.background(0);
    s.circle(40, 40, 40);
    s.circle(80, 40, 40);
  };
};

const sketchInstance = new p5.default(sketch);
