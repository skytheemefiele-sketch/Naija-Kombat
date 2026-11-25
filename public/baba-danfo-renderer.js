/* Baba Danfo — fully procedural canvas fighter. No sprite assets/network requests. */
(() => {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function draw(ctx,p){
    const t=p.walk||0, dir=p.dir||1, ground=p.grounded!==false;
    const moving=Math.abs(p.vx||0)>8, run=Math.abs(p.vx||0)>175;
    const hit=p.hit>0||p.stun>.18, block=!!p.block;
    const attack=p.attack>0, type=p.attackType||'light';
    const jump=!ground, down=p.knockdown||p.down||p.hp<=0;
    const phase=attack?clamp(p.attack,0,1):0;
    const pulse=Math.sin(t*5.4), breath=Math.sin(t*2.6);
    let bob=ground?(moving?Math.abs(Math.sin(t*(run?13:9)))*3:breath*1.6):0;
    if(hit)bob-=3; if(down)bob=0;
    const skin='#9a6040', skinHi='#c4875c', skinShade='#6e422f';
    const gold='#f4c72f', yellow='#ffd84a', black='#17191d', dark='#242932';
    const cloth='#e0ad20', white='#f2e8cf';
    ctx.save();ctx.translate(p.x,p.y+bob);ctx.scale(dir,1);
    // shadow
    ctx.globalAlpha=jump?.22:.36;ctx.fillStyle='#050609';ctx.beginPath();ctx.ellipse(0,4,jump?25:34,jump?4:7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(down){ctx.rotate(-.9);ctx.translate(-2,-12)}
    // Body proportions and state-specific pose
    const lean=hit?-0.12:block?.06:attack?(type==='heavy'?.24:type==='super'?.36:.18):moving?(run?.08:.02):0;
    ctx.translate(0,0);ctx.rotate(lean);
    const stride=moving&&ground?Math.sin(t*(run?13:9))*13:0;
    const crouch=block?5:0, airborne=jump?Math.max(0,-(p.vy||0)*.06):0;
    // legs with knees, boots
    const legPose=attack?(type==='heavy'?22:type==='super'?32:14):0;
    function leg(x,angle,skinPart=false){
      ctx.save();ctx.translate(x,-48+crouch);ctx.rotate(angle);
      rounded(-10,-2,20,27,7);fillGrad(-10,-2,10,24,dark,'#3b414a');stroke('#101216',2);
      rounded(-8,18,16,22,6);fillGrad(-8,18,8,38,skinShade,skin);stroke('#171416',1.5);
      ellipse(0,34,8,7,skinHi);
      rounded(-15,35,30,14,5);fillGrad(-15,35,15,49,'#111317','#30343a');stroke('#090a0c',2);
      ctx.fillStyle=gold;ctx.fillRect(-11,40,22,3);
      ctx.restore();
    }
    leg(-12,ground?stride*.012+legPose*.018:attack?.18:-.15);
    leg(12,ground?-stride*.012-(attack?legPose*.012:0):.16);
    // belt/waist
    rounded(-26,-59+crouch,52,20,7);fillGrad(-26,-59,26,-39,'#17191d','#383b40');stroke('#0b0c0f',2);
    ctx.fillStyle=gold;ctx.fillRect(-23,-54,46,4);rounded(-8,-52,16,11,3);ctx.fillStyle=yellow;ctx.fill();stroke('#4b3510',1);
    // torso: broad, athletic chest
    ctx.beginPath();ctx.moveTo(-25,-103+crouch);ctx.quadraticCurveTo(-34,-99,-33,-78);ctx.lineTo(-27,-57);ctx.quadraticCurveTo(0,-49,27,-57);ctx.lineTo(33,-78);ctx.quadraticCurveTo(34,-99,25,-103);ctx.closePath();fillGrad(-32,-100,32,-55,'#232830','#454b53');stroke('#101216',2.4);
    // yellow singlet panels and chest definition
    ctx.beginPath();ctx.moveTo(-25,-101);ctx.lineTo(-16,-97);ctx.lineTo(-11,-72);ctx.lineTo(-22,-62);ctx.closePath();ctx.fillStyle=gold;ctx.fill();
    ctx.beginPath();ctx.moveTo(25,-101);ctx.lineTo(16,-97);ctx.lineTo(11,-72);ctx.lineTo(22,-62);ctx.closePath();ctx.fillStyle=gold;ctx.fill();
    ellipse(-11,-89,12,10,'#525862');ellipse(11,-89,12,10,'#525862');
    ctx.strokeStyle='#181b20';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-96);ctx.lineTo(0,-66);ctx.moveTo(-15,-80);ctx.quadraticCurveTo(0,-75,15,-80);ctx.stroke();
    // shoulder armor/strap and danfo badge
    rounded(-28,-105,56,9,4);fillGrad(-28,-105,28,-96,'#171a1f',gold);stroke('#0d0e11',1.5);
    rounded(-13,-93,26,15,3);ctx.fillStyle=gold;ctx.fill();stroke('#6b4b12',1);
    ctx.fillStyle='#18191d';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('DANFO',0,-83);
    // neck
    rounded(-9,-119,18,19,5);fillGrad(-9,-119,9,-100,skinShade,skin);
    // arms: pose via shoulder/elbow/wrist
    function arm(side){
      let shoulderX=side*27, shoulderY=-99, elbowX=side*40, elbowY=-78, wristX=side*33,wristY=-57;
      let armAngle=side===1?-.24:.28;
      if(block){elbowX=side*24;elbowY=-119;wristX=side*12;wristY=-126}
      else if(attack){const ext=type==='heavy'?1.15:type==='super'?1.35:1;
        if(side===1){elbowX=34+phase*18;elbowY=-83-phase*9;wristX=49+phase*39*ext;wristY=-86-phase*9-(type==='super'?16:0)}
        else {elbowX=-39;elbowY=-77;wristX=-34;wristY=-56}
      }else if(hit){elbowX=side*20;elbowY=-91;wristX=side*13;wristY=-76}
      else if(moving){elbowX=side*38;elbowY=-82+Math.sin(t*9+side)*8;wristX=side*32;wristY=-57+Math.sin(t*9+side)*10}
      else{elbowX=side*39;elbowY=-80+Math.sin(t*4+side)*3;wristX=side*32;wristY=-56+Math.sin(t*4+side)*4}
      limb(shoulderX,shoulderY,elbowX,elbowY,17,skinShade,skin);ellipse(elbowX,elbowY,9,9,skinHi,'#301d17',1);
      limb(elbowX,elbowY,wristX,wristY,13,skin,skinShade);
      // wrist wrap
      ctx.save();ctx.translate(wristX,wristY);ctx.rotate(Math.atan2(wristY-elbowY,wristX-elbowX));rounded(-7,-7,15,13,3);ctx.fillStyle=gold;ctx.fill();stroke('#2b2015',1.5);ctx.restore();
      // large fighting glove
      const gx=wristX+side*4,gy=wristY+5;
      ellipse(gx,gy,13,12,black,'#07080a',2);ellipse(gx+side*2,gy-2,10,8,'#34383e','#0b0c0e',1.5);
      ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.beginPath();ctx.arc(gx,gy,10,.2,2.8);ctx.stroke();
      // knuckle highlight
      for(let k=0;k<3;k++)ellipse(gx+side*(3+k*3),gy-4,2,2,'#737982');
    }
    arm(-1);arm(1);
    // head, face, beard
    const headY=-126+crouch;
    ellipse(0,headY,22,25,skin,'#241714',2);
    ellipse(-8,headY-5,7,12,skinHi);ellipse(9,headY-2,5,10,skinShade);
    // ears
    ellipse(-23,headY+1,5,8,skin);ellipse(23,headY+1,5,8,skin);
    // hairline and close-cut hair
    ctx.beginPath();ctx.moveTo(-21,headY-11);ctx.quadraticCurveTo(-16,headY-28,0,headY-27);ctx.quadraticCurveTo(18,headY-27,21,headY-10);ctx.lineTo(14,headY-12);ctx.lineTo(9,headY-16);ctx.lineTo(1,headY-13);ctx.lineTo(-9,headY-17);ctx.lineTo(-17,headY-12);ctx.closePath();ctx.fillStyle='#151313';ctx.fill();stroke('#08090a',1.5);
    // brows, eyes, nose, mouth
    ctx.strokeStyle='#251713';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-13,headY-5);ctx.lineTo(-5,headY-7);ctx.moveTo(5,headY-7);ctx.lineTo(13,headY-5);ctx.stroke();
    ellipse(-9,headY-1,3,2,'#15100f');ellipse(9,headY-1,3,2,'#15100f');
    ctx.strokeStyle=skinShade;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,headY);ctx.lineTo(-2,headY+7);ctx.lineTo(3,headY+8);ctx.stroke();
    ctx.strokeStyle='#211512';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,headY+12);ctx.quadraticCurveTo(0,headY+15,6,headY+12);ctx.stroke();
    // beard/goatee
    ctx.beginPath();ctx.moveTo(-11,headY+11);ctx.quadraticCurveTo(-8,headY+20,0,headY+22);ctx.quadraticCurveTo(9,headY+20,12,headY+10);ctx.lineTo(7,headY+13);ctx.lineTo(0,headY+17);ctx.lineTo(-7,headY+13);ctx.closePath();ctx.fillStyle='#171313';ctx.fill();
    // yellow-black headband
    rounded(-23,headY-20,46,8,3);ctx.fillStyle=gold;ctx.fill();stroke('#19120b',1.5);
    ctx.fillStyle=black;ctx.fillRect(-4,headY-20,8,8);
    // ear/neck chain and signature bus-conductor strap
    ctx.strokeStyle=gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-22,-115);ctx.lineTo(-28,-100);ctx.lineTo(-18,-91);ctx.stroke();
    // small shoulder strap
    ctx.strokeStyle='#14171c';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(20,-101);ctx.lineTo(5,-67);ctx.stroke();
    ctx.strokeStyle=gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(20,-101);ctx.lineTo(5,-67);ctx.stroke();
    // impact / special visuals, all vector-based
    if(attack&&(type==='special'||type==='super')){
      const power=type==='super'?1.7:1;
      ctx.globalAlpha=.5+.3*Math.sin(t*22);ctx.strokeStyle=type==='super'?'#fff1a3':gold;ctx.lineWidth=type==='super'?7:4;
      ctx.beginPath();ctx.arc(wristX||44,-83,26*power,-1.5,.8);ctx.stroke();
      ctx.globalAlpha=.85;ctx.fillStyle=yellow;ctx.beginPath();ctx.moveTo(50,-84);ctx.lineTo(68,-98);ctx.lineTo(65,-84);ctx.lineTo(84,-76);ctx.lineTo(60,-67);ctx.closePath();ctx.fill();
    }
    if(p.superActive>0){ctx.globalAlpha=.2+.12*Math.sin(t*12);ctx.strokeStyle=gold;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-68,38,60,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
    function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
    function fillGrad(x1,y1,x2,y2,a,b){const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fill()}
    function stroke(c,w){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke()}
    function ellipse(x,y,rx,ry,c,st,lw=1){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();if(st)stroke(st,lw)}
    function limb(x1,y1,x2,y2,w,a,b){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#171317';ctx.lineWidth=w+3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(.5,b);g.addColorStop(1,a);ctx.strokeStyle=g;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
    return true;
  }
  window.babaDanfoSprites={draw,get ready(){return true},get failed(){return 0},state(p){if(p.hit>0||p.stun>.18)return'hit';if(p.block)return'block';if(p.attack>0)return p.attackType||'light';if(p.grounded===false)return'jump';return Math.abs(p.vx||0)>175?'run':Math.abs(p.vx||0)>8?'walk':'idle'}};
})();