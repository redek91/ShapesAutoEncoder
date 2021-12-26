int counter = 0;
final int DATASET_SIZE = 5000;
final int DATA_DIMENSION = 28;

void setup() {
  size(280,280);
}

void draw() {
  background(255);
  float r = random(100,200);
  strokeWeight(16);
  rectMode(CENTER);
  square(width/2, height/2, r);

  PImage img = get();
  img.resize(DATA_DIMENSION,DATA_DIMENSION);
  img.save("Data/square" + nf(counter, 5) + ".png");
  counter++;

  if(counter == DATASET_SIZE){
    exit();
  }
}
