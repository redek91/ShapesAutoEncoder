final int DATASET_SIZE = 20000;
final int DATA_DIMENSION = 48;
final int STROKE_WEIGHT = 16;
final int CANVAS_SIZE = 280;
final boolean SAVE = true; // Save images
final boolean RANDOM_COLOR = false; // Only black if false
final boolean MORE_SHAPES = true; // Only squares if false

int counter = 0;
int counterSquares = 0;
int counterCircles = 0;
int counterEllipses = 0;
int counterTriangles = 0;

void settings(){
  int s = CANVAS_SIZE;
  size(s,s);
}

void setup() {
  //frameRate(4);
  strokeWeight(STROKE_WEIGHT);
  rectMode(CENTER);
}

void draw() {
  background(255);

  // Random size and color and shape
  float shapeSize = random(STROKE_WEIGHT + 10,CANVAS_SIZE / 2 - STROKE_WEIGHT);
  //float shapeSize = CANVAS_SIZE / 2 - STROKE_WEIGHT; // Max size
  //float shapeSize = STROKE_WEIGHT + 10; // Min size

  color shapeColor;
  if (RANDOM_COLOR){
    shapeColor = color(random(0,255), random(0,255), random(0,255));
  } else {
    shapeColor = color(0);
  }
  stroke(shapeColor);

  if (MORE_SHAPES) {
    drawShape(counter % 4, shapeSize);
  } else{
    // Only squares
    drawShape(0, shapeSize);
  }
  
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
  square(width / 2, height / 2, 2 * size);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/squares/" + nf(counterSquares, 5) + ".png");
  }
  counterSquares++;
}

void drawTriangle(float size) {
  // Generate random points and
  PVector start = new PVector(width / 2, height / 2);

  PVector p1 = PVector.add(start, new PVector(0, -size));
  PVector p2 = PVector.add(start, new PVector(size, size));
  PVector p3 = PVector.add(start, new PVector(-size, size));

  triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/triangles/" + nf(counterTriangles, 5) + ".png");
  }
  counterTriangles++;
}

void drawCircle(float size) {
  ellipse(width / 2, height / 2, 2 * size, 2 * size);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/circles/" + nf(counterCircles, 5) + ".png");
  }
  counterCircles++;
}

void drawEllipse(float size) {
  float ellipseWidthFactor = random(0.5, 1);
  float ellipseHeightFactor = random(0.5, 1);
  ellipse(width / 2, height / 2, 2 * size * ellipseWidthFactor, 2 * size * ellipseHeightFactor);

  if (SAVE) {
    PImage img = get();
    img.resize(DATA_DIMENSION,DATA_DIMENSION);
    img.save("Data/ellipses/" + nf(counterEllipses, 5) + ".png");
  }
  counterEllipses++;
}