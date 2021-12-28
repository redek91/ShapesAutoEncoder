final int DATASET_SIZE = 5000;
final int DATA_DIMENSION = 28;
final boolean SAVE = true; // Save images
final boolean RANDOM_COLOR = false; // Only black if false
final boolean RANDOM_SHAPE = false; // Only squares if false


int counter = 0;

void setup() {
  size(280,280);
  //frameRate(4);
}

void draw() {
  background(255);

  // Random size and color and shape
  float shapeSize = random(50,130);

  color shapeColor;
  if (RANDOM_COLOR){
    shapeColor = color(random(0,255), random(0,255), random(0,255));
  } else {
    shapeColor = color(1);
  }
   
  int shapeType;
  if (RANDOM_SHAPE){
    shapeType = (int) floor(random(0,4));
  } else {
    shapeType = 0; // Only squares
  }

  strokeWeight(5);
  stroke(shapeColor);
  rectMode(RADIUS);

  drawShape(shapeType, shapeSize);
  counter++;

  if (counter == DATASET_SIZE) {
    exit();
  }
}

void drawShape(int type, float size) {
  switch (type) {
    case 0: // Square
      drawSquare(size);
      break;
    case 1: // Circle
      drawCircle(size);
      break;
    case 2: // Triangle
      drawTriangle(size);
      break;
    case 3: // Ellipse
      drawEllipse(size);
      break;
  }
}

void drawSquare(float size) {
  square(width / 2, height / 2, size);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/square" + nf(counter, 5) + ".png");
  }
}

void drawTriangle(float size) {
  // Generate random points and
  PVector start = new PVector(width / 2, height / 2);

  PVector p1 = PVector.sub(start, PVector.random2D().setMag(size));
  PVector p2 = PVector.sub(start, PVector.random2D().setMag(size));
  PVector p3 = PVector.sub(start, PVector.random2D().setMag(size));
  triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/triangle" + nf(counter, 5) + ".png");
  }
}

void drawCircle(float size) {
  ellipse(width / 2, height / 2, size, size);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/circle" + nf(counter, 5) + ".png");
  }
}

void drawEllipse(float size) {
  float ellipseWidthFactor = random(1);
  float ellipseHeightFactor = random(1);
  ellipse(width / 2, height / 2, size * ellipseWidthFactor, size * ellipseHeightFactor);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/ellipse" + nf(counter, 5) + ".png");
  }
}