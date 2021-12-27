import * as tf from "@tensorflow/tfjs-node-gpu";
import numeral from "numeral";
import jimp from "jimp";
import { test_util } from "@tensorflow/tfjs-node-gpu";

const INPUT_WIDTH = 28;

//main();
test();

async function test(): Promise<void> {
  const autoencoder = await tf.loadLayersModel("file://MLModel/ModelTrainer/autoEncoderModel/model.json");

  const images = await trainingData(200);
  const x_test = tf.tensor2d(images);
  await generateTests(autoencoder, x_test);
}

async function main(): Promise<void> {
  const images = await trainingData(5000);

  const { decoderLayers, autoencoder } = buildModel();

  const x_train = tf.tensor2d(images);
  await trainModel(autoencoder, x_train, 200);
  await autoencoder.save("file://MLModel/ModelTrainer/autoEncoderModel");

  const decoder = createDecoder(decoderLayers);
  await decoder.save("file://MLModel/ModelTrainer/decoderModel");

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
    const num = numeral(i).format("00000");
    const img = await jimp.read(`MLModel/TrainDataGenerator/Data/square${num}.png`);

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

  const decoderLayers: tf.layers.Layer[] = [];
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

async function trainModel(autoencoder: any, x_train: any, epochs: number) {
  await autoencoder.fit(x_train, x_train, {
    epochs: epochs,
    batchSize: 64,
    shuffle: true,
    verbose: 1,
  });
}

function createDecoder(decoderLayers: any[]): tf.Sequential {
  const decoder = tf.sequential();

  for (let layer of decoderLayers) {
    const newLayer = tf.layers.dense({
      units: layer.units,
      activation: layer.activation,
      inputShape: [layer.kernel.shape[0]],
    });
    decoder.add(newLayer);
    newLayer.setWeights(layer.getWeights());
  }

  decoder.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  return decoder;
}

async function generateTests(autoencoder: any, x_test: any) {
  const output = autoencoder.predict(x_test);

  const newImages = await output.array();
  for (let i = 0; i < newImages.length; i++) {
    const img = newImages[i];
    const buffer = [];
    for (let n = 0; n < img.length; n++) {
      const val = Math.floor(img[n] * 255);
      buffer[n * 4 + 0] = val;
      buffer[n * 4 + 1] = val;
      buffer[n * 4 + 2] = val;
      buffer[n * 4 + 3] = 255;
    }
    const image = new jimp(
      {
        data: Buffer.from(buffer),
        width: INPUT_WIDTH,
        height: INPUT_WIDTH,
      },
      (err, image) => {
        const num = numeral(i).format("0000");
        image.write(`MLModel/ModelTrainer/testOutput/square${num}.png`);
      }
    );
  }
}
