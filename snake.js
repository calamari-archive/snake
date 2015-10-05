// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}

var ArcadeFont = {
  alphabet: {
    'A': '28,54,99,99,127,99,99',
    'B': '63,99,99,63,99,99,63',
    'C': '62,99,3,3,3,99,62',
    'D': '31,51,99,99,99,51,31',
    'E': '127,3,3,63,3,3,127',
    'F': '63,3,3,31,3,3,3,0',
    'G': '62,99,3,115,99,99,62',
    'H': '99,99,99,127,99,99,99,0',
    'I': '30,12,12,12,12,12,30,0',
    'J': '96,96,96,96,96,99,62',
    'K': '99,51,27,15,27,51,99',
    'L': '3,3,3,3,3,3,127',
    'M': '99,119,127,107,99,99,99',
    'N': '99,103,111,127,123,115,99',
    'O': '62,99,99,99,99,99,62',
    'P': '63,99,99,99,63,3,3',
    'Q': '62,99,99,99,123,51,94',
    'R': '63,99,99,63,27,51,99',
    'S': '62,99,3,127,96,99,62',
    'T': '63,12,12,12,12,12,12',
    'U': '99,99,99,99,99,99,62',
    'V': '99,99,99,99,54,28,8',
    'W': '99,99,99,107,127,119,99',
    'X': '99,119,62,28,62,119,99',
    'Y': '51,51,51,30,12,12,12',
    'Z': '127,112,56,28,14,7,127',
    ' ': '0,0,0,0,0,0,0',
    '1': '12,14,12,12,12,12,63',
    '2': '62,99,112,60,6,3,127',
    '3': '126,48,24,60,96,99,62',
    '4': '56,60,54,51,127,48,48',
    '5': '127,3,63,96,96,99,62',
    '6': '62,99,3,63,99,99,62',
    '7': '127,96,48,24,12,12,12',
    '8': '62,99,99,62,99,99,62',
    '9': '62,99,99,126,96,99,62',
    '0': '62,99,99,99,99,99,62'
  },

  // space between letters
  gutter: 2,

  blueprint: function(text) {
    var blueprint = [],
        letter, letterCode, line, g, i, l, j;
    text = text.toUpperCase();
    for (i in text) {
      letterCode = this.alphabet[text[i]].split(',');

      for (j = 0, l = letterCode.length; j<l; ++j) {
        line = EightBit.decodeNumber(letterCode[j], 7);
        if (!blueprint[j]) {
          blueprint[j] = '';
        }
        blueprint[j] += line;
        for (g = this.gutter; g--;) {
          blueprint[j] += '0';
        }
      }
    }
    return blueprint.join('\n');
  }
};

var drawPoint = function(x, y) {
  this.ctx.beginPath();
  this.ctx.arc(x * this.rasterSize + this.rasterSize/2, y * this.rasterSize + this.rasterSize/2, this.pixelSize/2, 0, Math.PI*2, true);
  this.ctx.closePath();
  this.ctx.fill();
  return
  this.ctx.fillRect(Math.round(x * this.rasterSize), Math.round(y * this.rasterSize), this.pixelSize, this.pixelSize);
};

var Food = function(ctx, config) {
  this.ctx = ctx;
  this.config = config;
  this.rasterSize = config.pixelSize;
  this.pixelSize = config.pixelSize / 2;
  this.x = config.position.x;
  this.y = config.position.y;
};
Food.prototype.drawPoint = drawPoint;
Food.prototype.redraw = function() {
  this.ctx.fillStyle = 'rgba(' + this.config.color + ', ' + 1 + ')';
  this.drawPoint(this.x, this.y);
};

var Snake = function(ctx, config) {
  this.ctx = ctx;
  this.config = config;
  this.length = 1;
  this.body = [];
  this.dir = config.direction;
  this.rasterSize = config.pixelSize;
  this.pixelSize = config.pixelSize;
  this.x = config.position.x;
  this.y = config.position.y;
  
  this.changeDir = function(x, y) {
    if (!((this.dir.x != 0 && x != 0) || this.dir.y != 0 && y != 0)) {
      this.nextDir = { x: x, y: y };
    }
  }
  this.move = function() {
    if (this.nextDir) {
      this.dir.x = this.nextDir.x;
      this.dir.y = this.nextDir.y;
      this.nextDir = null;
    }
    this.body.unshift({ x: this.x, y: this.y });
    this.x += this.dir.x;
    this.y += this.dir.y;
    this.body = this.body.slice(0, this.length-1);
  };
  
  this.add = function() {
    ++this.length;
  };
};
Snake.prototype.drawPoint = drawPoint;
Snake.prototype.redraw = function() {
  this.ctx.fillStyle = 'rgba(' + this.config.color + ', ' + 1 + ')';
  this.drawPoint(this.x, this.y);
  for (var i=0; i<this.body.length; ++i) {
    this.drawPoint(this.body[i].x, this.body[i].y);
  }
};

var SnakeGame = function(canvas, config) {
  var ctx = canvas.getContext('2d'),
      pixelWidth = Math.floor(canvas.width / config.pixelSize),
      pixelHeight = Math.floor(canvas.height / config.pixelSize),
      
      food = [],

      doLoop = true,
      snake,
      lastStepTime = new Date(),
      lastLoopTime;

  start();

  function start() {
    snake = new Snake(ctx, {
      color: '255,0,120',
      direction: { x: 1, y: 0 },
      position: { x: ~~(pixelWidth / 2), y: ~~(pixelHeight / 2) },
      pixelSize: config.pixelSize
    });
    
    loop();
    
    for (var i=0; i<config.numFood; ++i) {
      createFood();
    }

    $(window).bind('keydown', keyHandler);
  }
  
  function createFood() {
    food.push(new Food(ctx, {
      color: '255,255,0',
      position: { x: Math.floor(Math.random() * pixelWidth), y: Math.floor(Math.random() * pixelHeight) },
      pixelSize: config.pixelSize,
    }));
  }

  function keyHandler(event) {
    var keyCode = event.which,
        time;
    if (keyCode === 37 || keyCode === 65) {
      // right on A or Arrow left
      snake.changeDir(-1, 0)
    } else if (keyCode === 38 || keyCode === 87) {
      // right on W or Arrow up
      snake.changeDir(0, -1)
    } else if (keyCode === 39 || keyCode === 68) {
      // right on D or Arrow right
      snake.changeDir(1, 0)
    } else if (keyCode === 40 || keyCode === 83) {
      // right on S or Arrow down
      snake.changeDir(0, 1)
    }
  }

  function loop() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    var loopTime  = new Date(),
        timeDiff  = (loopTime - lastLoopTime) / 1000; // in ms

    if (lastStepTime < loopTime - config.stepTime) {
      snake.move();
      lastStepTime = loopTime;
    }
    
    snake.redraw();
    
    for (var i=0, l=food.length; i<l; ++i) {
      food[i].redraw();
    }
        
    // check collision
    for (var i=food.length; i--;) {
      if (food[i].x == snake.x && food[i].y == snake.y) {
        food.splice(i, 1);
        snake.add();
        createFood();
      }
    }
    for (var i=snake.body.length; i--;) {
      if (snake.body[i].x == snake.x && snake.body[i].y == snake.y) {
        doLoop = false;
      }
    }
    
    // check if outside
    if (snake.x < 0) {
      snake.x = pixelWidth-1;
    }
    if (snake.x >= pixelWidth) {
      snake.x = 0;
    }
    if (snake.y < 0) {
      snake.y = pixelHeight-1;
    }
    if (snake.y >= pixelHeight) {
      snake.y = 0;
    }
        
    lastLoopTime = loopTime;
    doLoop && window.requestAnimFrame(loop);
  }
};

$(document).ready(function() {
  var gameCanvas = document.getElementById('game');
  gameCanvas.width  = $(window).width();
  gameCanvas.height = $(window).height();
  
  var game = new SnakeGame(gameCanvas, {
    pixelSize: gameCanvas.height * gameCanvas.width / 20000,
    stepTime: 88,
    numFood: 10//gameCanvas.height * gameCanvas.width / 10000
  });
});