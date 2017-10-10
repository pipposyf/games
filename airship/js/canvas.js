//全局变量
var can=null;
var ctx=null;
var bullets=null;
var stars=null;
var QM=20;
var timeHandle=null;
var emitter=null;
var status=null;
var xa=null;
var ya=null;
var time=0;
var mstatus=1;
var listTime=60;
//数组
//加载页面
window.onload=function(){
	can=document.getElementById("myCanvas");
	ctx=can.getContext("2d");
	ctx.save();
	can.width=window.innerWidth;
	can.height=window.innerHeight;
	window.onresize=function(){
		can.width=window.innerWidth;
		can.height=window.innerHeight;
	}
	if(!localStorage.maxScore){
		localStorage.setItem("maxScore",0);
	}
	if(!sessionStorage.playTimes){
		sessionStorage.setItem("playTimes",0);
	}
	game1 = new Game();
	game1.gameload();    
	};



	//Game
	function Game(){
      this.gameStatus;
      this.airship;
      this.bullets;
      this.stars;
      this.timeHandle;
      this.scene;
      // this.emitter2;
      this.Emitter;
      this.check1;
      this.check2;
      this.GameAudio;
	};
	Game.prototype.gameload=function(){
		var self=this;
		this.music0 = new GameAudio("bg","bgmusic/bgm.mp3",true);
		this.music0.play();
        this.gameStatus="begin";
        this.scene=new Scene();
        document.onkeydown=function(e){
        if(keys.status==false&&e.which==32){//按空格游戏开始
           keys.set();

           self.gameSet();
        }else if(keys.status){
        	keys.enterQ(e.which);
        }
      };
      this.gameRender();
	};
    Game.prototype.gameSet=function(){
    	sessionStorage.playTimes =Number(sessionStorage.playTimes)+1; 
    	this.gameStatus="play";
        this.airship = new AirShip(can.width/2,can.height/2,10,40);
	    this.scene = new Scene();
    
    //行星数组

        this.stars = new Array();
        for(var i=0;i<Math.random()*30+1;i++){
    	    var star = new Star(Math.random()*can.width,Math.random()*can.height,Math.random()*20+20);
    	    star.set();
    	    this.stars.push(star);
     }
    //子弹数组
     this.bullets=new Array();
     for(var i=0;i<5;i++){
    	 var bullet=new Bullet(
                    this.x+Math.sin(this.angle)*this.sh,
                    this.y-Math.cos(this.angle)*this.sh,
                    this.angle
		      	);
		    this.bullets.push(bullet);
    }
    this.music1 = new GameAudio("bg2","bgmusic/shoot3.mp3",false);
    this.music2 = new GameAudio("bg3","bgmusic/airshipexp.mp3",false);
    this.music3 = new GameAudio("bg4","bgmusic/starexp.wav",false);
    };
    
    Game.prototype.gameRender=function(){
	ctx.restore();	
	ctx.clearRect(0,0,can.width,can.height);
	ctx.save();
    switch(this.gameStatus){
    	case "begin":
    	      this.scene.beginScene();
    	      break;
    	case "play":
    	      this.scene.playScene();
    	          if(this.airship.life){
	                 this.airship.update(this.bullets,this.music1);
	                 this.airship.draw();
                    	
                    }
                  if(this.bullets){
    	            for(var i=0;i<this.bullets.length;i++){
		    		this.bullets[i].update();
		    		this.bullets[i].draw();
		    		if(this.bullets[i].s<0){
		    		this.bullets.splice(i,1);
		    		
    		}
    	}
    } 
                   if(this.stars){
			    	for(var i=0;i<this.stars.length;i++){
			    		this.stars[i].update();
			    		this.stars[i].draw();
			    	}
			    	// console.log(this.stars.length);
    	            for(var i=0;i<this.stars.length;i++){
		    		      if(check1(this.stars[i],this.airship)){ 
							emitter = new Emitter(100,1,this.airship.x,this.airship.y,"circle",20);
							this.airship.life = false;
							if(mstatus==1) {this.music2.play();}
							status = 3;
							
							
			            }else if(check2(this.stars[i],this.bullets)){
				              emitter2 = new Emitter(100,1,this.stars[i].x,this.stars[i].y,"rect",20);
                              if(mstatus==1) {this.music3.play();}
							  this.stars.splice(i,1);
							  this.scene.score++;
							  status = 2;
						    
				    		}
         } 	
      }
				    if(status==3){
				    	emitter.update();
                        if(emitter.particles.length==0){
                        status=null;
			        	this.gameStop("lost");
			        }

				    }
                    if(status==2){
			    	emitter2.update();
			         }
			         
			        if(this.stars.length==0){
			        	if(emitter2.particles.length==0){this.gameStop("win");}
			        }
			        if(Math.round(this.scene.fps/60)==listTime){this.gameStop("lost");};
         break;
    case "lost":
         this.scene.lostScene();
         break;
    case "win":
          this.scene.winScene();
    }
	timeHandle=requestAnimationFrame(Game.prototype.gameRender.bind(this));	
    };
    Game.prototype.gameStop =function(status){
    	var self=this;
      this.gameStatus=status;
      keys.status=false;
      self.music0.pause();
      document.onkeydown=function(e){
      	game1=null;
      	game1=new Game();
      	game1.gameload();
      }
      console.log(this.scene.score);
      if(this.scene.score>localStorage.maxScore){
      	localStorage.maxScore=this.scene.score;
      }
    }




	//定义
    var keys={
     front:0,
     rear:0,
     ks:new Array(20),
     status:false,
     set:function(){//队列初始化
     	keys.front=0;
     	keys.rear=0;
     	keys.ks=new Array(QM);
     	keys.status=true;
     },
     enterQ:function(k){//入队操作
     if((keys.rear+1)%QM!=keys.front){
     	keys.ks[keys.rear]=k;
     	keys.rear=(keys.rear+1)%QM;

     }
     },
     delQ:function(k){//出队操作
     if(keys.front!=keys.rear){
     	var k=keys.ks[keys.front];
     	keys.front=(keys.front+1)%QM;
     	return k;
     }
       return null;
     }
    };

//碰撞检测：飞船流行
function check1(star2,airship){
       if(airship.life){
       	var x1=airship.x+Math.sin(airship.angle)*airship.sh;
	    var y1=airship.y-Math.cos(airship.angle)*airship.sh;
	    var x2=star2.x;
	    var y2=star2.y;
	    var r = star2.r;
	    if(disc(x1,y1,x2,y2)<r){
	    return true;
       }	
	    x1=airship.x-Math.cos(airship.angle)*airship.sw;
		y1=airship.y-Math.sin(airship.angle)*airship.sw;
		 if(disc(x1,y1,x2,y2)<r){
	    	return true;
	    }

	    x1=airship.x+Math.cos(airship.angle)*airship.sw,
		y1=airship.y+Math.sin(airship.angle)*airship.sw;
         if(disc(x1,y1,x2,y2)<r){
	    	return true;
	    }
    }
}
//碰撞检测：子弹流星
function check2(star,bullets){
    for(var j=0;j<bullets.length;j++){
    var x1=bullets[j].x;
    var y1=bullets[j].y;
    var x2=star.x;
	var y2=star.y;
	var r=star.r;
	if(disc(x1,y1,x2,y2)<r){
	 	return true;
	 }	
    }
}
//disc
function disc(x1,y1,x2,y2){
	return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}


//飞船class
var AirShip=function(x,y,sw,sh){
	this.x=x;
	this.y=y;
	this.sh=sh;
	this.sw=sw;
	this.angle=Math.PI*0;//0-2*Math.PI
	this.speed=0;
	this.life=true;
};
AirShip.prototype.draw = function() {
	//ctx.clearRect(0,0,can.width,can.height);
	ctx.strokeStyle="rgb(223,62,62)";
	ctx.beginPath();
	ctx.moveTo(this.x+Math.sin(this.angle)*this.sh,
		       this.y-Math.cos(this.angle)*this.sh);
	ctx.lineTo(this.x-Math.cos(this.angle)*this.sw,
		       this.y-Math.sin(this.angle)*this.sw);
	ctx.lineTo(this.x+Math.sin(this.angle)*this.sh/3,
		       this.y-Math.cos(this.angle)*this.sh/3);
	ctx.lineTo(this.x+Math.cos(this.angle)*this.sw,
		       this.y+Math.sin(this.angle)*this.sw);
	ctx.closePath();
	ctx.stroke();
};
AirShip.prototype.update=function(bullets,music1){
	//this.angle+=Math.PI/100;
	this.x+=Math.sin(this.angle)*this.speed;
	this.y-=Math.cos(this.angle)*this.speed;

	if(this.x<this.sh||this.x>can.width-this.sh){
		this.angle=this.angle+Math.PI;
	}else if(this.y<this.sh||this.y>can.height-this.sh){
		this.angle=this.angle+Math.PI;
	}
//键盘对像响应
if(keys&&keys.status){
	if(keys.front==keys.rear){
		return;
	}
	var k=keys.ks[keys.front];
	keys.front=(keys.front+1)%QM;
	switch(k){
		case 37:
		    this.angle-=Math.PI/50;
		    break;
		case 38:
		    if(this.speed<2){
		    	this.speed+=1;
		    }
		    break;
		case 39:
		    this.angle+=Math.PI/50;
		    break;
		case 40:
		     this.angle+=Math.PI;
		     break;
		case 67:
		    game1.music0.pause();
            mstatus=2;
            console.log(mstatus);
		    break;
		case 32:
		//console.log(mstatus);
		if(mstatus==1){music1.play();}
		      var bullet=new Bullet(
                    this.x+Math.sin(this.angle)*this.sh,
                    this.y-Math.cos(this.angle)*this.sh,
                    this.angle
		      	);
		    bullets.push(bullet);
		    break;

		case 79:
		    game1.music0.play();
            mstatus=1;	    
		    break;

	}
}	
};

//子弹class
var Bullet = function(x,y,angle){
    this.x=x;
    this.y=y;
    this.angle=angle;
    this.speed=3;
	this.h=5;
	this.s=300;
}
Bullet.prototype.draw = function(){
	ctx.strokeStyle="red";
	ctx.lineWidth=5;
	ctx.beginPath();
	ctx.moveTo(this.x,this.y);
	ctx.lineTo(this.x+Math.sin(this.angle)*this.h,this.y-Math.cos(this.angle)*this.h);
	ctx.closePath();
	ctx.stroke();
};
Bullet.prototype.update=function(){
	this.x+=Math.sin(this.angle)*this.speed;
	this.y-=Math.cos(this.angle)*this.speed;
	this.s-=this.speed;
}

//小行星
var Star = function(x,y,r){
	//this.n=Math.radmon()*12+3;
	this.x=x;
	this.y=y;
	this.r=r;
	this.vs=null;
	this.speed=2;
	this.dir=1;
	
}
//初始化多边形
Star.prototype.set=function(){
	var n=Math.round(Math.random()*15+6);
	//数组
	this.vs=new Array();
	for(var i=0;i<n;i++){
		var a=Math.random()*Math.PI*2;
		this.vs.push(a);
	}
	//角度排序
	this.vs.sort();
	this.speed=Math.random()*4-2;

  }
Star.prototype.draw = function(){
	var colors2 = ["#1bc0f0","#4d7682","#b6e9f8","#107abd","#1d4e80","#61d1e2"];
	var style1 = colors2[~~(Math.random() * colors2.length)];

    ctx.strokeStyle="#1bc0f0";
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(this.x+this.r*Math.sin(this.vs[0]),
               this.y+this.r*Math.cos(this.vs[0])
               );
    for(var i=1;i<this.vs.length;i++){
    	ctx.lineTo(this.x+this.r*Math.sin(this.vs[i]),
    		       this.y+this.r*Math.cos(this.vs[i])
    		       );
    }
    ctx.closePath();
    ctx.stroke();
}
// Star.prototype.update=function(){
//        this.x+=this.speed;
//        this.y+=this.speed;
// 	 if(this.x>can.width+this.r){
// 	 	this.x=-this.r;
// 	   }else if(this.x<=-this.r){
// 	 	this.x=can.width+this.r;
// 	   }else if(this.y>=can.height){
// 	 	this.y=-this.r;
// 	   }else if(this.y<=-this.r){
// 	 	this.y=can.height+this.r;
// 	  }
// }
Star.prototype.update=function(){
       this.x+=this.speed;
       this.y+=this.speed;
	 if(this.x>can.width+this.r*2){
	 	this.x=0;
	 }
	 if(this.x<-this.r){
	 	this.x=can.width;
	 }
	 if(this.y>can.height+this.r*2){
	 	this.y=0;
	 }
	 if(this.y<-this.r){
        this.y=can.height+this.r;
	 }
}

//---------------------粒子效果--------------------------------------------------------
function Particle(x0,y0,shape,size){
	var colors = ["#6A0000", "#900000", "#902B2B", "#A63232", "#A62626", "#FD5039", "#C12F2A", "#FF6540", "#f93801"];
	var colors2 = ["#1bc0f0","#4d7682","#b6e9f8","#107abd","#1d4e80","#61d1e2"];
	this.r = Math.random()*2+4;
	this.x = x0;
	this.y = y0;
	//更改粒子的爆炸范围
	this.vx = Math.random()*4-2;
	this.vy = Math.random()*4-2;
	this.gravity = 0.1;//重力效果
	this.shape = shape;
	this.color = colors[~~(Math.random() * colors.length)];
	this.color2 = colors2[~~(Math.random() * colors2.length)];
	this.size = size;
	this.life = Math.random()*180+60;// 根据浏览器刷新速度来决定时间
    
}
Particle.prototype.draw = function(){
	
	ctx.beginPath();
	if(this.shape == "circle"){
	ctx.fillStyle = this.color;
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.closePath();
    ctx.fill();
	}else if(this.shape == "rect"){
	ctx.fillStyle = this.color2;
	ctx.fillRect(this.x,this.y,Math.random()*2,Math.random()*2);
    }

    this.update();
 }
Particle.prototype.update = function(){
     this.x += this.vx;
     this.y += this.vy;
     this.vy += this.gravity;
     //this.vx -= Math.random()*this.gravity;
     this.life--;

};
//粒子发射器
function Emitter(len,type,x0,y0,shape,size){
	this.len = len;
	this.particles = new Array();
	this.type = type;
	this.life = true;
	this.x = x0;
	this.y = y0;
	this.shape=shape;
	this.size=size;
	this.init();
}
Emitter.prototype.init=function(){
    for(var i=0;i<this.len;i++){
    	var p = new Particle(this.x,this.y,this.shape,this.size);
    	this.particles.push(p);
    }  
}
Emitter.prototype.update=function(){
 	for(var i=0;i<this.particles.length;i++){
		this.particles[i].draw();
		if(this.particles[i].life<=0){
			this.particles.splice(i,1);
		}
	}
	this.len = this.particles.length;
	if(this.len<=0){
		this.life = false;
		//console.log(this.life);
	}  

}
//场景
function Scene(){
   //this.bg=new emitter(xxxx);
   this.tipTxt="Press SPACE to start...";
   this.nameTxt=new Array("太","空","战","舰");
   this.winTxt="你赢了";
   this.lostTxt="你输了";
   this.controlText=["←向左转","→向右转","↑加速","↓掉头","space射击","按C关闭bgm","按O播放bgm"];
   this.colors=["rgba(0,200,200,1)","rgba(0,200,200,0.6)"];
   this.index=0;
   this.fps=0;
   this.score=0;
};
Scene.prototype.beginScene=function(){
	ctx.restore();
	ctx.save();
   //this.bg.update();
   this.fps++;
   if(this.fps>=30){
   	this.fps=0;
   	this.index=(this.index+1)%this.nameTxt.length;
   }
   ctx.font="120px Arial";
   ctx.strokeStyle="rgba(0,200,200,1)";
   for(var i=0;i<this.nameTxt.length;i++){
   	if(this.index==i){
   		ctx.strokeStyle=this.colors[0];
   	}else {ctx.strokeStyle=this.colors[1];}
     ctx.strokeText(this.nameTxt[i],can.width/2-300+i*150,can.height/2);
   }
   ctx.font="48px Arial";
   ctx.fillStyle="#fff";
   ctx.textAlign="center";
   ctx.fillText(this.tipTxt,can.width/2,can.height/2+300);
};
Scene.prototype.playScene=function(){
   ctx.restore();
   ctx.save();
   ctx.beginPath();
   
   ctx.font="12px Arial";
   ctx.fillStyle="#fff";
   ctx.textAlign="left";
   for(var i=0;i<this.controlText.length;i++){
   ctx.fillText(this.controlText[i],can.width-100,can.height/2+20*i);
   }
   ctx.fillText("maxScore:"+localStorage.maxScore,can.width-100,100);
   ctx.fillText("playTimes"+sessionStorage.playTimes,can.width-100,70);

   ctx.font="14px Arial";
   ctx.fillStyle="#f00";
   ctx.fillText("Shotted:"+this.score,can.width/2,30);
   this.fps++;
   ctx.fillText("Times:"+Math.round(this.fps/60)+"s",can.width/2,50);

   Timecount();
   
};
Scene.prototype.winScene=function(){
   ctx.font="40px Arial";
   ctx.fillStyle="#f00";
   ctx.textAlign="center";
   ctx.fillText(this.winTxt,can.width/2,can.height/2);
   ctx.fillText("你的得分是："+this.score,can.width/2,can.height/2+200);
   ctx.fillText("按任意键重新开始",can.width/2,can.height/2+300);
   ctx.fillText("你存活了："+Math.round(this.fps/60)+"s",can.width/2,can.height/2+150);
};
Scene.prototype.lostScene=function(){
   // ctx.restore();
   // ctx.save();
   // ctx.beginPath();
   ctx.font="40px Arial";
   ctx.fillStyle="#fff";
   ctx.textAlign="center";
   ctx.fillText(this.lostTxt,can.width/2,can.height/2);
   ctx.fillText("你存活了："+Math.round(this.fps/60)+"s",can.width/2,can.height/2+150);
   ctx.fillText("你的得分是："+this.score,can.width/2,can.height/2+200);  
   ctx.fillText("继续努力！按任意键重新开始",can.width/2,can.height/2+300);
};

//音效类
function GameAudio(id,file,loop){
	var audioplayer=document.getElementById(id);
	if(audioplayer!=null){
		document.body.removeChild(audioplayer);
	}
	if(typeof(file)!='undefined'){
		this.player=document.createElement("audio");
		this.player.id=id;
		if(loop){
			this.player.setAttribute("loop","loop");
		}
		document.body.appendChild(this.player);
		var audio=document.createElement("source");
		audio.src=file;
		audio.type="audio/mp3";
		this.player.appendChild(audio);
        }

}
GameAudio.prototype.play=function(){
this.player.play();
}
GameAudio.prototype.pause=function(){
this.player.pause();
}
//左上角倒计时
function Timecount(){
   ctx.restore();
   ctx.save();
   ctx.beginPath();
   ctx.strokeStyle="#db5c39";
   ctx.arc(100,100,40,0,Math.PI*2);
   ctx.stroke();
   ctx.beginPath();
   ctx.strokeStyle="#fff";
   ctx.arc(100,100,40,0,Math.PI*2*((Math.round(game1.scene.fps/60))/listTime));
   ctx.stroke();
   ctx.font="18px Arial";
   ctx.fillStyle="#f00";
   ctx.fillText(Math.round(60-(Math.round(game1.scene.fps/60))),90,106);
}

