# ShapesAutoEncoder

An autoencoder that is capable to create squares using machinelearning.

test @ [Netlify](https://thirsty-hopper-f11601.netlify.app/)

## Build, serve, train

Install needed packages with npm i

### To generate Training data

- Install processing and add processing-java.exe to PATH
- Run the sketch from processing IDE or run the task `run sketch` in VS CODE (here is where the PATH is needed)

### To train the model (GPU only)

Run `npm run train`

### To try out

Run `npm run start`

### To build

Run `npm run build`

## Used frameworks

- p5: for rendering
- processing: for training data generation
- tensorflow-js: for model training
- webpack: .... just for testing it out...I guess

## Todo-list

- [x] Create project structure
- [x] Create training data generator
- [x] Create auto encoder model and play with parameters (activation functions, loss, ecc.)
- [x] Create interface with p5
- [x] Add more shapes
- [ ] Try Conv2d layers
- [ ] Add rotation, translation to training data
- [ ] Add colors to training data
- [ ] Try out other datatypes (images??, sound??, gifs??)

## Credits

This project is inspired by the Auto-Encoder-Demo project by Daniel Shiffman @CodingTrain [GitHub - CodingTrain](https://github.com/CodingTrain)
