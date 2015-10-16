'use strict';
(function(){
  window.addEventListener('load', init, false);
  window.addEventListener('resize', resize, false);
  var canvas = null, ctx = null;
  var lastPress = null;
  var KEY_ENTER = 13;
  var KEY_LEFT = 37;
  var KEY_UP = 38;
  var KEY_RIGHT = 39;
  var KEY_DOWN = 40;
  var dir = 0;
  var pause = false;
  var gameover = false;
  var score = 0;

  var highscores = [];

  var currentScene=0, scenes=[];
  var mainScene = new Scene();
  var gameScene = new Scene();
  var highscoresScene = new Scene();

  var iBody = new Image();
  var iFood = new Image();
  iBody.src = 'img/snake.png';
  iFood.src = 'img/apple.png';
  var aEat = new Audio(), aDie = new Audio();
  aEat.src='sounds/eat.mp3';
  aDie.src='sounds/crash.mp3';

  //var player = new Rectangle(40, 40, 10, 10);
  var body =[] ;
  var food = new Rectangle(80, 80, 10, 10);
  var wall = [];

  wall.push(new Rectangle(100,50,10,10));
  wall.push(new Rectangle(100,100,10,10));
  wall.push(new Rectangle(200,50,10,10));
  wall.push(new Rectangle(200,100,10,10));

  function init(){
    if(localStorage.highscores){
      highscores = localStorage.highscores.split(',');
    }
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    resize();
    run();
    repaint();
  }

  function Scene(){
    this.id= scenes.length;
    scenes.push(this);
  }

  Scene.prototype.load = function(){};
  Scene.prototype.act = function(){};
  Scene.prototype.paint = function(ctx){};

  function loadScene(scene){
    currentScene = scene.id;
    scenes[currentScene].load();
  }


  function run(){
    setTimeout(run, 50);
    if(scenes.length){
      scenes[currentScene].act();
    }
  }

  function repaint(){
    requestAnimationFrame(repaint);
    if(scenes.length){
      scenes[currentScene].paint(ctx);
    }
  }

  mainScene.act = function(){
    if(lastPress==KEY_ENTER){
      loadScene(highscoresScene);
      lastPress=null;
    }
  }

  mainScene.paint=function(ctx){
    ctx.fillStyle='#030';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.fillText('SNAKE',150,60);
    ctx.fillText('Press Enter',150,90);
  }

  gameScene.load=function(){
    score=0;
    dir=1;
    body.length=0;
    body.push(new Rectangle(40,40,10,10));
    body.push(new Rectangle(30,40,10,10));
    food.x=random(canvas.width/10-1)*10;
    food.y=random(canvas.height/10-1)*10;
    gameover=false;
  }

  gameScene.act= function(){
    if(!pause){
      // GameOver Reset
      if(gameover)
        loadScene(highscoresScene);
      // Change Direction
      if(lastPress==KEY_UP && dir!=2)
        dir=0;
      if(lastPress==KEY_RIGHT && dir!=3)
        dir=1;
      if(lastPress==KEY_DOWN && dir!=0)
        dir=2;
      if(lastPress==KEY_LEFT && dir!=1)
        dir=3;
      // Move Body
      for(var i=body.length-1;i>0;i--){
         body[i].x=body[i-1].x;
         body[i].y=body[i-1].y;
      }
      // Move Head
          if(dir==0)
              body[0].y-=10;
          if(dir==1)
              body[0].x+=10;
          if(dir==2)
              body[0].y+=10;
          if(dir==3)
              body[0].x-=10;
      // Out Screen
        if(body[0].x>canvas.width-body[0].width)
            body[0].x=0;
        if(body[0].y>canvas.height-body[0].height)
            body[0].y=0;
        if(body[0].x<0)
            body[0].x=canvas.width-body[0].width;
        if(body[0].y<0)
            body[0].y=canvas.height-body[0].height;
      // Food Intersects
      if(body[0].intersects(food)){
        aEat.play();
        score++;
        food.x=random(canvas.width/10-1)*10;
        food.y=random(canvas.height/10-1)*10;
        body.push(new Rectangle(food.x,food.y,10,10));
      }
      // Wall Collisions
      for(var w of wall){
         if(food.intersects(w)){
           food.x=random(canvas.width/10-1)*10;
           food.y=random(canvas.height/10-1)*10;
         }

         if(body[0].intersects(w)){
           aDie.play();
           gameover = true;
           pause = true;
           addHighscore(score);
         }
      }
      // Body Intersects
      for(var i=2;i<body.length;i++){
        if(body[0].intersects(body[i])){
          aDie.play();
          gameover=true;
          pause=true;
          addHighscore(score);
        }
      }
    }

    if(lastPress ==KEY_ENTER){
      pause = !pause;
      lastPress = null;
    }
  }

  gameScene.paint = function(ctx){
    ctx.fillStyle = '#030';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    for(var b of body){
      b.drawImage(ctx, iBody);
    }
    ctx.textAlign='left';
    ctx.fillStyle = '#f00';
    food.drawImage(ctx, iFood);
    ctx.fillText('Score: '+score,0,10);

    ctx.fillStyle='#999';
    for (var rect of wall){
      rect.fill(ctx);
    }
    if(pause){
      ctx.textAlign='center';
      if(gameover)
        ctx.fillText('GAME OVER',150,75);
      else
        ctx.fillText('PAUSE',150,75);

    }
  }

  highscoresScene.act= function(){
    if(lastPress==KEY_ENTER){
      loadScene(gameScene);
      lastPress=null;
    }
  }

  highscoresScene.paint = function(ctx){
    ctx.fillStyle='#030';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.fillText('HIGH SCORES',150,30);
    ctx.textAlign='right';
    var drawed = false;
    for(var i=highscores.length-1; i>=0; i--){
      if(score==highscores[i] && drawed==false){
        ctx.fillText('*'+highscores[i],180,40+i*10);
        drawed=true;
      }else{
        ctx.fillText(highscores[i],180,40+i*10);
      }
    }
  }

  document.addEventListener('keydown',function(evt){
    lastPress = evt.keyCode;
    if(lastPress >=37 && lastPress <=40){
      evt.preventDefault();
    }
  }, false);

  function Rectangle(x, y, width, height){
    this.x = (x==null)?0:x;
    this.y = (y==null)?0:y;
    this.width = (width==null)?0:width;
    this.height = (height==null)?0:height;
  }
  Rectangle.prototype.intersects = function(rect){
    if(rect!=null){
      return(this.x < rect.x + rect.width &&
             this.x + this.width > rect.x &&
             this.y < rect.y + rect.height &&
             this.y + this.height > rect.y);
    }
  }

  Rectangle.prototype.fill = function(ctx){
    if(ctx!=null){
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  Rectangle.prototype.drawImage=function(ctx,img){
    if(img.width){
      ctx.drawImage(img,this.x,this.y);
    }else{
      ctx.strokeRect(this.x,this.y,this.width,this.height);
    }
  }


  function random(max){
    return Math.floor(Math.random()*max);
  }

  function addHighscore(score){
    var i = 0;
    while(i<highscores.length && score<=highscores[i]){
      i++;
    }
    highscores.splice(i, 0, score);
    if(highscores.length>10){
      highscores.length=10;
    }
    localStorage.highscores = highscores.join(',');
    console.log("saced");
    console.log(localStorage.highscores);
  }

  function resize(){
    var w = window.innerWidth/canvas.width;
    var h = window.innerHeight/canvas.height;
    var scale = Math.min(w,h);
    console.log((canvas.width * scale) + 'px');
    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';
  }
})();
