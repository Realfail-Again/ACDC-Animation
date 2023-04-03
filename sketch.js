const GRASS_COLOR = "#5da360";
const SNOW_COLOR = "#FFFFFF";

let skyColor = "#B1E8FF";
const SKY_SPACE = 0.75;

// Colors for the Ridge

const GRASS_TOP_COLOR = "#caf39c";
const GRASS_BOT_COLOR = "#074a35";
const SNOW_TOP_COLOR = "##dcf5f3";
const SNOW_BOT_COLOR = "#65afb8";
const FALL_TOP_COLOR = "#f0d265";
const FALL_BOT_COLOR = "#6e4826";

// Ridge Variables

let ridgeStep = 0.4;
let ridgeAmp = 75;
let ridgeZoom = 0.5;

// Starting tree angle

let treeAngle = 0;

// Color Gradient

let startColor = 255;
let speedAnimate = 1.5;

// Snow Constants
const SNOWFLAKES_PER_LAYER = 50;
const MAX_SIZE = 5;
const GRAVITY = 0.5;
const LAYER_COUNT = 8;
const WIND_SPEED = 1;
const WIND_CHANGE = 0.0025;
const SNOWFLAKES = [];

//Sun Variables

let r;
let glowSize = 1.5;
let glowGrowthBool = true;

// Angle and angular velocity, accleration for Sun
let theta;
let theta_vel;
let theta_acc;

//Controls Oscillation
let x = 0;
let frequency = 0.1; // adjust this value to change the frequency of oscillation
let amplitude = 0.2; // adjust this value to change the amplitude of oscillation

// Set Up the Penrose Tiles

let ds;

// Timer Variables

let timer = 100;
let nextChange = timer;
let timerOn = true;

// Season Control

let seasons = ["winter", "spring", "summer", "herbst", "special"];
let seasonIndex = 0;
let season = seasons[seasonIndex];
let seasonTimer = 8000;
let nextSeasonChange = seasonTimer;
let resetSpecialTimer = seasonTimer * seasons.length * 3

// Will run once when the sketch is opened
function setup() {
  createCanvas(540, 540);
  fill(GRASS_COLOR);
  setupSun();
  setupSnow();
  setupPenrose();
}

function draw() {
  doSeason();
  if (millis() > nextChange && timerOn) {
    nextChange = millis() + timer;
  }
  if (millis() > nextSeasonChange) {
    nextSeasonChange = millis() + seasonTimer;
    if (seasonIndex < seasons.length - 1) {
      seasonIndex++;
      season = seasons[seasonIndex];
    } else {
      seasonIndex = 0;
      season = seasons[seasonIndex];
    }
  }
  if (millis() > resetSpecialTimer){
    setupPenrose();
    resetSpecialTimer = resetSpecialTimer * 2;
  }
}

function doSeason() {
  let goldenSun = color(223, 250, 17);
  let winterSun = color(245, 213, 125);
  switch (season) {
    case "winter":
      background(171, 162, 245);
      drawSun(winterSun);
      timerOn = false;
      ridgeStep = 20;
      ridgeAmp = 25;
      ridgeZoom = 10;
      drawSnow();
      drawRidges();
      drawSnow();
      break;
    case "spring":
      loop();
      timerOn = true;
      gradientBackground();
      drawSun(goldenSun);
      ridgeStep = 0.4;
      ridgeAmp = 75;
      ridgeZoom = 0.5;
      drawTree(1, width * 0.33, height * 0.7, 30);
      drawTree(2, width * 0.33, height * 0.7, 30);
      drawRidges();
      break;
    case "summer":
      gradientBackground();
      drawSun(goldenSun);
      drawTree(1, width * 0.33, height * 0.7, 80);
      drawTree(2, width * 0.33, height * 0.7, 50);
      ridgeStep = 0.5;
      ridgeAmp = 68;
      ridgeZoom = 0.1;
      drawRidges();
      break;
    case "herbst":
      background(224, 212, 233);
      drawSun(goldenSun);
      drawTree(1, width * 0.3, height * 0.75, 20);
      ridgeStep = 0.4;
      ridgeAmp = 20;
      ridgeZoom = 0.5;
      drawRidges();
      break;
    case "special":
      background(100);
      drawSnow();
      stroke(skyColor);
      drawPenrose();
      break;
    default:
      gradientBackground();
  }
}

function keyPressed(){
    if (seasonIndex < seasons.length - 1) {
      seasonIndex++;
      season = seasons[seasonIndex];
    } else {
      seasonIndex = 0;
      season = seasons[seasonIndex];
  }
}

function setupPenrose() {
  ds = new PenroseLSystem();
  //please, play around with the following line
  ds.simulate(5);
}

function drawPenrose() {
  angleMode(RADIANS)
  ds.render();
}

function setupSnow() {
  // Initialize the snowflakes with random positions
  for (let l = 0; l < LAYER_COUNT; l++) {
    SNOWFLAKES.push([]);
    for (let i = 0; i < SNOWFLAKES_PER_LAYER; i++) {
      SNOWFLAKES[l].push({
        x: random(width),
        y: random(height),
        mass: random(0.75, 1.25),
        l: l + 1,
      });
    }
  }
}

function drawSnow() {
  // Iterate through each snowflake to draw and update them
  noStroke();
  ellipseMode(CENTER);
  for (let l = 0; l < SNOWFLAKES.length; l++) {
    const LAYER = SNOWFLAKES[l];

    for (let i = 0; i < LAYER.length; i++) {
      const snowflake = LAYER[i];
      fill(SNOW_COLOR);
      circle(snowflake.x, snowflake.y, (snowflake.l * MAX_SIZE) / LAYER_COUNT);
      updateSnowflake(snowflake);
    }
  }
}

// Helper function to prepare a given snowflake for the next frame
function updateSnowflake(snowflake) {
  const diameter = (snowflake.l * MAX_SIZE) / LAYER_COUNT;
  if (snowflake.y > height + diameter) snowflake.y = -diameter;
  else snowflake.y += GRAVITY * snowflake.l * snowflake.mass;

  // Get the wind speed at the given layer and area of the page
  const wind =
    noise(snowflake.l, snowflake.y * WIND_CHANGE, frameCount * WIND_CHANGE) -
    0.5;
  if (snowflake.x > width + diameter) snowflake.x = -diameter;
  else if (snowflake.x < -diameter) snowflake.x = width + diameter;
  else snowflake.x += wind * WIND_SPEED * snowflake.l;
}

function gradientBackground() {
  if (startColor > height + 255 || startColor < 255) {
    speedAnimate *= -1;
  }
  startColor += speedAnimate;

  let numRectangles = 30;
  let rectHeight = height / numRectangles;
  for (let y = 0; y < height; y += rectHeight) {
    let bVal = startColor - y;
    let gVal = startColor;
    fill(0, gVal, bVal);
    rect(0, y, width, rectHeight);
  }
}

function drawTree(i, x, y, branchSize, startAngle) {
  angleMode(RADIANS);
  treeAngle += 0.005;
  if (treeAngle > PI / 4 || treeAngle < -PI / 4) {
    treeAngle *= -1;
  }
  push();
  stroke(0);
  strokeWeight(2);
  translate(x * i, y);
  branch(branchSize);
  pop();
}

function branch(len) {
  line(0, 0, 0, -len);
  translate(0, -len);
  if (len > 4) {
    push();
    rotate(treeAngle);
    branch(len * 0.67);
    pop();
    push();
    rotate(-treeAngle);
    branch(len * 0.67);
    pop();
  }
}

function drawPerson() {
  push();
  rectMode(CENTER);
  stroke(0);
  strokeWeight(3);
  fill(255);
  translate(width/2,height/2 + 170);
  angleMode(RADIANS);
  x += frequency;
  let y = Math.sin(x) * amplitude;
  let mappedValue = map(y, -1, 1, -PI/2, PI/2);
  rotate(mappedValue);
  rect(30, -10, 15, 40); //Left Arm
  rect(-30, -10, 15, 40); // Right Arm
  rect(0, 0, 50, 85); // Body
  rect(0, -60, 35, 35); // Head
  pop();
}

function drawRidges() {
  const skyHeight = round(height * SKY_SPACE);

  // Iterate through the layers of snowflakes
  for (let l = 0; l < LAYER_COUNT; l++) {
    // Draw a ridge for each layer of snow
    const layerPosition = l * ((height - skyHeight) / LAYER_COUNT);
    if (l == LAYER_COUNT / 2) {
      drawPerson();
    }
    drawRidge(l, skyHeight + layerPosition);
  }
}

// Compute and draw a ridge
function drawRidge(l, y) {
  noStroke();
  let fillColor;
  // Choose a color for the ridge based on its height
  switch (season) {
    case "spring":
      fillColor = lerpColor(
        color(GRASS_TOP_COLOR),
        color(GRASS_BOT_COLOR),
        l / (LAYER_COUNT - 1)
      );
      break;
    case "winter":
      fillColor = lerpColor(
        color(SNOW_TOP_COLOR),
        color(SNOW_BOT_COLOR),
        l / (LAYER_COUNT - 1)
      );
      break;
    case "herbst":
      fillColor = lerpColor(
        color(FALL_TOP_COLOR),
        color(FALL_BOT_COLOR),
        l / (LAYER_COUNT - 1)
      );
      break;
    case "summer":
      fillColor = lerpColor(
        color(FALL_TOP_COLOR),
        color(GRASS_BOT_COLOR),
        l / (LAYER_COUNT - 1)
      );
      break;
    case "special":
      fillColor = lerpColor(
        color(FALL_TOP_COLOR),
        color(FALL_BOT_COLOR),
        l / (LAYER_COUNT - 1)
      );
      break;
  }

  fill(fillColor);

  beginShape();
  // Iterate through the width of the canvas
  for (let x = 0; x <= width; x += ridgeStep) {
    const noisedY = noise(x * ridgeZoom * nextChange, y);
    vertex(x, y - noisedY * ridgeAmp);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
  fill(GRASS_COLOR);
}

function setupSun() {
  r = height * 0.4;
  theta = 0;
  theta_vel = 0.005;
}

function drawSun(sunColor) {
  let glowColor = color(247, 240, 178, 4);
  // Convert polar to cartesian
  let sunX = r * cos(theta);
  let sunY = r * sin(theta);
  push();
  noStroke();
  translate(width / 2, height / 2);
  ellipseMode(CENTER);
  fill(sunColor);
  circle(sunX, sunY, 100);
  fill(glowColor);
  x += frequency;
  let y = Math.sin(x) * amplitude;
  let mappedValue = map(y, -1, 1, 0, 4);
  for (i = 0; i < 100; i++) {
    ellipse(sunX, sunY, i * mappedValue);
  }
  pop();

  theta += theta_vel;
}

function PenroseLSystem() {
  this.steps = 0;

  //these are axiom and rules for the penrose rhombus l-system
  //a reference would be cool, but I couldn't find a good one
  this.axiom = "[X]++[X]++[X]++[X]++[X]";
  this.ruleW = "YF++ZF----XF[-YF----WF]++";
  this.ruleX = "+YF--ZF[---WF--XF]+";
  this.ruleY = "-WF++XF[+++YF++ZF]-";
  this.ruleZ = "--YF++++WF[+ZF++++XF]--XF";

  //please play around with the following two lines
  this.startLength = 600.0;
  this.theta = TWO_PI / 10.0; //36 degrees, try TWO_PI / 6.0, ...
  this.reset();
}

PenroseLSystem.prototype.simulate = function (gen) {
  while (this.getAge() < gen) {
    this.iterate(this.production);
  }
};

PenroseLSystem.prototype.reset = function () {
  this.production = this.axiom;
  this.drawLength = this.startLength;
  this.generations = 0;
};

PenroseLSystem.prototype.getAge = function () {
  return this.generations;
};

//apply substitution rules to create new iteration of production string
PenroseLSystem.prototype.iterate = function () {
  let newProduction = "";

  for (let i = 0; i < this.production.length; ++i) {
    let step = this.production.charAt(i);
    //if current character is 'W', replace current character
    //by corresponding rule
    if (step == "W") {
      newProduction = newProduction + this.ruleW;
    } else if (step == "X") {
      newProduction = newProduction + this.ruleX;
    } else if (step == "Y") {
      newProduction = newProduction + this.ruleY;
    } else if (step == "Z") {
      newProduction = newProduction + this.ruleZ;
    } else {
      //drop all 'F' characters, don't touch other
      //characters (i.e. '+', '-', '[', ']'
      if (step != "F") {
        newProduction = newProduction + step;
      }
    }
  }

  this.drawLength = this.drawLength * 0.5;
  this.generations++;
  this.production = newProduction;
};

//convert production string to a turtle graphic
PenroseLSystem.prototype.render = function () {
  translate(width / 2, height / 2);

  this.steps += 20;
  if (this.steps > this.production.length) {
    this.steps = this.production.length;
  }

  for (let i = 0; i < this.steps; ++i) {
    let step = this.production.charAt(i);

    //'W', 'X', 'Y', 'Z' symbols don't actually correspond to a turtle action
    if (step == "F") {
      stroke(52, 232, 235, 60);
      for (let j = 0; j < this.repeats; j++) {
        line(0, 0, 0, -this.drawLength);
        noFill();
        translate(0, -this.drawLength);
      }
      this.repeats = 1;
    } else if (step == "+") {
      rotate(this.theta);
    } else if (step == "-") {
      rotate(-this.theta);
    } else if (step == "[") {
      push();
    } else if (step == "]") {
      pop();
    }
  }
};

/* Citations

Blitz, David. “Penrose Tiles.” P5.Js, https://p5js.org/examples/simulate-penrose-tiles.html. Accessed 27 Feb. 2023. (Blue Tile Effect)

Larsen, Anders. “Let It Snow with Perlin Noise in P5.Js.” Javascript Christmas, 16 Dec. 2020, https://www.javascript.christmas/2020/16. (The Snow and Grass Effects)

Shiffman, Daniel. “Recursive Tree.” P5.Js, https://p5js.org/examples/simulate-recursive-tree.html. Accessed 27 Feb. 2023. (The Tree Effect)

stalgiag. “Class 5: Gradient Animated.” P5.Js Web Editor, https://editor.p5js.org/stalgiag/sketches/webaJ2Dpe. Accessed 27 Feb. 2023. (The Changing Background)

OpenAI. "ChatGPT." OpenAI, 2 Mar. 2023, https://openai.com/. (The oscillation snippet)

https://github.com/spite/ccapture.js/#using-the-code
*/