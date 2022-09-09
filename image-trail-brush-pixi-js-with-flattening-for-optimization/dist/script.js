const width = window.innerWidth;
const height = window.innerHeight;
const spriteUrl = 'https://picsum.photos/400/400/';

const app = new PIXI.Application(width, height, {
  transparent: true });

app.renderer.autoResize = true;
document.body.appendChild(app.view);

const stage = new PIXI.Container();
app.stage.addChild(stage);

const trail = [];
const limit = 500;
const maxDensity = 500;

var combinedTexture;
var combinedSprite = new PIXI.Sprite();
combinedSprite.zOrder = -1;
combinedSprite.position.x = 0;
combinedSprite.position.y = 0;

stage.addChild(combinedSprite);

let texture = PIXI.Texture.fromImage(spriteUrl);
let brush = new PIXI.Sprite(texture);
let previousPosition;

brush.position.x = 250;
brush.position.y = 250;
brush.width = 200;
brush.height = 200;
brush.anchor.set(0.5, 0.5);

stage.addChild(brush);

app.stage.interactive = true;
app.stage.on('pointermove', e => {
  moveTo(e.data.global);
});

function moveTo(position) {
  let limitedPosition = limitPosition(position);
  drawIntermediate(previousPosition, limitedPosition);

  brush.position.copy(limitedPosition);

  previousPosition = limitedPosition.clone();

  scheduleFlatten();
}

function limitPosition(position) {
  let offsetX = brush.width / 2;
  let offsetY = brush.height / 2;
  return new PIXI.Point(
  Math.max(offsetX, Math.min(app.renderer.view.width - offsetX, position.x)),
  Math.max(offsetY, Math.min(app.renderer.view.height - offsetY, position.y)));

}

function paintBrush(position) {
  let copy = new PIXI.Sprite(texture);
  copy.position.copy(position);
  copy.width = 200;
  copy.height = 200;
  copy.anchor.set(0.5, 0.5);
  stage.addChild(copy);

  trail.push(copy);

  if (trail.length > limit) {
    flatten();
  }
}

function drawIntermediate(prev, curr) {
  if (prev) {
    let density = calculateInterpolationDensity(prev, curr);
    for (let i = 0; i <= density; i++) {
      paintBrush(interpolate(prev, curr, i / density));
    }
  } else {
    paintBrush(curr);
  }
}

function calculateInterpolationDensity(prev, curr) {
  let dx = Math.abs(prev.x - curr.x);
  let dy = Math.abs(prev.y - curr.y);

  return Math.round(
  Math.min(
  Math.max(dx, dy),
  maxDensity));


}

function interpolate(a, b, frac) {
  var nx = a.x + (b.x - a.x) * frac;
  var ny = a.y + (b.y - a.y) * frac;
  return new PIXI.Point(nx, ny);
}

function flatten() {
  let combinedTexture = app.renderer.generateTexture(stage);
  combinedSprite.texture = combinedTexture;

  while (trail.length) {
    let trash = trail.pop();
    stage.removeChild(trash);
    trash.destroy();
  }
}

let flattenTimeout;

function scheduleFlatten() {
  if (flattenTimeout) {
    clearTimeout(flattenTimeout);
  }

  flattenTimeout = setTimeout(flatten, 2000);
}

window.addEventListener('resize', () => {
  const parent = app.view.parentNode;
  app.renderer.resize(parent.clientWidth, parent.clientHeight);
});