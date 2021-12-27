import * as tf from "@tensorflow/tfjs-node-gpu";
import * as numeral from "numeral";
import * as Jimp from "jimp";
import { ModelLoggingVerbosity } from "@tensorflow/tfjs-layers/dist/base_callbacks";
import { Sequential, Tensor2D } from "@tensorflow/tfjs-node-gpu";

const INPUT_WIDTH = 28;

main();

async function main(): Promise<void> {
  const images = await trainingData(200);

  const { decoderLayers, autoencoder } = buildModel();

  const x_train = tf.tensor2d(images);
  await trainModel(autoencoder, x_train, 50);
  await autoencoder.save("MLModel/ModelTrainer/model");

  console.log(autoencoder.summary());
}

/**
 * Loads Training data formatted like square000000.png
 * @param quantity Quantity to load
 * @returns Array of images as number array
 */
async function trainingData(quantity: number): Promise<number[][]> {
  const trainingData: number[][] = [];

  // Read raw data
  for (let i = 0; i < quantity; i++) {
    const num = numeral.default(i).format("00000");
    const img = await Jimp.read(`MLModel/TrainDataGenerator/Data/square${num}.png`);

    let rawData: number[] = [];
    for (let j = 0; j < INPUT_WIDTH * INPUT_WIDTH; j++) {
      let rgbaIndex = j * 4;
      let r = img.bitmap.data[rgbaIndex + 0];

      // Normalize
      rawData[j] = r / 255.0;
    }
    trainingData[i] = rawData;
  }

  // Normalize values

  return trainingData;
}

/**
 *
 * @returns Decoderlayers and compiled autoencoder model
 */
function buildModel() {
  const autoencoder = tf.sequential();

  autoencoder.add(
    tf.layers.dense({
      units: 256,
      inputShape: [INPUT_WIDTH * INPUT_WIDTH],
      activation: "relu",
    })
  );
  autoencoder.add(
    tf.layers.dense({
      units: 128,
      activation: "relu",
    })
  );
  autoencoder.add(
    tf.layers.dense({
      units: 64,
      activation: "relu",
    })
  );
  autoencoder.add(
    tf.layers.dense({
      units: 16,
      activation: "relu",
    })
  );
  autoencoder.add(
    tf.layers.dense({
      units: 4,
      activation: "relu",
    })
  );

  const decoderLayers = [];
  decoderLayers.push(
    tf.layers.dense({
      units: 16,
      activation: "relu",
    })
  );
  decoderLayers.push(
    tf.layers.dense({
      units: 64,
      activation: "relu",
    })
  );
  decoderLayers.push(
    tf.layers.dense({
      units: 128,
      activation: "relu",
    })
  );
  decoderLayers.push(
    tf.layers.dense({
      units: 256,
      activation: "relu",
    })
  );
  decoderLayers.push(
    tf.layers.dense({
      units: INPUT_WIDTH * INPUT_WIDTH,
      activation: "sigmoid",
    })
  );

  for (let layer of decoderLayers) {
    autoencoder.add(layer);
  }

  autoencoder.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  return { decoderLayers, autoencoder };
}

async function trainModel(autoencoder: Sequential, x_train: Tensor2D, epochs: number) {
  await autoencoder.fit(x_train, x_train, {
    epochs: epochs,
    batchSize: 64,
    shuffle: true,
    verbose: ModelLoggingVerbosity.VERBOSE,
  });
}
