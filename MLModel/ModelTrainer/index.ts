import * as tf from "@tensorflow/tfjs-node-gpu";
import numeral from "numeral";
import jimp from "jimp";

const INPUT_WIDTH = 48;
const EPOCHS = 400;
const INPUT_SIZE = 5000;
const MORE_SHAPES = true;

main();

async function test(): Promise<void> {
  const autoencoder = await tf.loadLayersModel("file://MLModel/ModelTrainer/autoEncoderModel/model.json");

  const images = await trainingData(5);
  const x_test = tf.tensor2d(images);
  await generateTests(autoencoder, x_test);
}

async function main(): Promise<void> {
  const images = await trainingData(INPUT_SIZE);

  const { decoderLayers, autoencoder } = buildModel();

  const x_train = tf.tensor2d(images);
  await trainModel(autoencoder, x_train, EPOCHS);
  await autoencoder.save("file://MLModel/ModelTrainer/autoEncoderModel");

  const decoder = createDecoder(decoderLayers);
  await decoder.save("file://MLModel/ModelTrainer/decoderModel");

  autoencoder.summary();
  decoder.summary();

  await test();
}

/**
 * Loads Training data formatted like square000000.png
 * @param quantity Quantity to load
 * @returns Array of images as number array
 */
async function trainingData(quantity: number): Promise<number[][]> {
  const trainingData: number[][] = [];

  // Read raw data squares
  for (let i = 0; i < quantity; i++) {
    const num = numeral(i).format("00000");
    const img = await jimp.read(`MLModel/TrainDataGenerator/Data/squares/${num}.png`);

    let rawData: number[] = [];
    for (let j = 0; j < INPUT_WIDTH * INPUT_WIDTH; j++) {
      let rgbaIndex = j * 4;
      let r = img.bitmap.data[rgbaIndex + 0];

      // Normalize
      rawData[j] = r / 255.0;
    }
    trainingData.push(rawData);
    process.stdout.write(`\rloading squares: ${i + 1} / ${quantity}`);
  }
  console.log("");

  if (MORE_SHAPES) {
    // Read raw data circles
    for (let i = 0; i < quantity; i++) {
      const num = numeral(i).format("00000");
      const img = await jimp.read(`MLModel/TrainDataGenerator/Data/circles/${num}.png`);

      let rawData: number[] = [];
      for (let j = 0; j < INPUT_WIDTH * INPUT_WIDTH; j++) {
        let rgbaIndex = j * 4;
        let r = img.bitmap.data[rgbaIndex + 0];

        // Normalize
        rawData[j] = r / 255.0;
      }
      trainingData.push(rawData);
      process.stdout.write(`\rloading circles: ${i + 1} / ${quantity}`);
    }
    console.log("");

    // Read raw data ellipses
    for (let i = 0; i < quantity; i++) {
      const num = numeral(i).format("00000");
      const img = await jimp.read(`MLModel/TrainDataGenerator/Data/ellipses/${num}.png`);

      let rawData: number[] = [];
      for (let j = 0; j < INPUT_WIDTH * INPUT_WIDTH; j++) {
        let rgbaIndex = j * 4;
        let r = img.bitmap.data[rgbaIndex + 0];

        // Normalize
        rawData[j] = r / 255.0;
      }
      trainingData.push(rawData);
      process.stdout.write(`\rloading ellipses: ${i + 1} / ${quantity}`);
    }
    console.log("");

    // Read raw data triangles
    for (let i = 0; i < quantity; i++) {
      const num = numeral(i).format("00000");
      const img = await jimp.read(`MLModel/TrainDataGenerator/Data/triangles/${num}.png`);

      let rawData: number[] = [];
      for (let j = 0; j < INPUT_WIDTH * INPUT_WIDTH; j++) {
        let rgbaIndex = j * 4;
        let r = img.bitmap.data[rgbaIndex + 0];

        // Normalize
        rawData[j] = r / 255.0;
      }
      trainingData.push(rawData);
      process.stdout.write(`\rloading triangles: ${i + 1} / ${quantity}`);
    }
    console.log("");
  }

  console.log(`Loaded ${trainingData.length} images!`);
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
      units: 512,
      inputShape: [INPUT_WIDTH * INPUT_WIDTH],
      activation: "relu",
    })
  );
  autoencoder.add(
    tf.layers.dropout({
      rate: 0.3,
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
      units: 8,
      activation: "relu",
    })
  );

  const decoderLayers: tf.layers.Layer[] = [];
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
      units: 512,
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
    if (layer.activation !== undefined) {
      const newLayer = tf.layers.dense({
        units: layer.units,
        activation: layer.activation,
        inputShape: [layer.kernel.shape[0]],
      });
      decoder.add(newLayer);
      newLayer.setWeights(layer.getWeights());
    } else {
      decoder.add(
        tf.layers.dropout({
          rate: layer.rate,
          //inputShape: [layer.kernel.shape[0]],
        })
      );
    }
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
        image.write(`MLModel/ModelTrainer/testOutput/${num}.png`);
      }
    );
  }
}
