import "./styles/index.scss";
import * as p5 from "p5";
import * as tf from "@tensorflow/tfjs";

import "../MLModel/ModelTrainer/decoderModel/model.json";
import "../MLModel/ModelTrainer/decoderModel/weights.bin";
import { LayersModel } from "@tensorflow/tfjs";

const MODEL_WIDTH = 28;
const MODEL_LATENT_VARS = 4;
const CANVAS_SIZE = 280;
const PIXEL_DENSITY = 1;

let decoder: LayersModel;
let scale: number;
let density: number;

let sliders: any = [];
let sliderValues = [0.5, 0.5, 0.5, 0.5];
let slidersChanged = true;

let currentImage: number[];

const sketch = (s: p5) => {
  s.setup = async () => {
    decoder = await tf.loadLayersModel("/model/model.json");
    s.createCanvas(CANVAS_SIZE, CANVAS_SIZE);

    // Set scale
    scale = s.width / MODEL_WIDTH;
    console.log(`Scale: ${scale} (Canvas:${s.width} / Model:${MODEL_WIDTH})`);

    // Set pixel density
    s.pixelDensity(PIXEL_DENSITY);
    density = s.pixelDensity();
    console.log(`Pixel density: ${density}`);

    // Ouput pixel info
    s.loadPixels();
    console.log(`Total pixels: ${s.pixels.length / 4} (RGBA)`);

    // Create Sliders
    s.createP("Latent variables");
    for (let i = 0; i < MODEL_LATENT_VARS; i++) {
      const currentSlider: any = s.createSlider(0, 1, 0.5, 0.01);
      currentSlider.input(() => (slidersChanged = true));
      sliders.push(currentSlider);
    }
    // Load first image
    await nextImage();
    console.log("finished setup");
  };

  s.draw = async () => {
    if (slidersChanged) {
      await nextImage();
      if (currentImage != null) render();
    }
  };

  function render(): void {
    s.background(255);
    s.loadPixels();

    for (let y = 0; y < s.height; y++) {
      for (let x = 0; x < s.width; x++) {
        const index = (x + y * s.width) * 4;
        const xScaled = s.floor(x / scale);
        const yScaled = s.floor(y / scale);
        let value = currentImage[xScaled + (yScaled * s.width) / scale] * 255;
        s.pixels[index + 0] = value;
        s.pixels[index + 1] = value;
        s.pixels[index + 2] = value;
      }
    }

    s.updatePixels();
    slidersChanged = false;
    //s.noLoop();
  }

  async function nextImage(): Promise<void> {
    for (let i = 0; i < MODEL_LATENT_VARS; i++) {
      sliderValues[i] = sliders[i].value();

      const x_text = tf.tensor2d([sliderValues]);
      const output: any = decoder.predict(x_text);
      currentImage = (await output.array())[0];
    }
    console.log("Loaded new image");
  }
};

const sketchInstance = new p5.default(sketch);
