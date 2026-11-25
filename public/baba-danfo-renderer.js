/* Baba Danfo sprite renderer: baseline anchored, facing mirrored, engine state driven.
   Missing files safely fall back to the existing procedural fighter renderer. */
(() => {
  const movement={idle:[0,1,2,3],walk:[4,5,6,7],run:[8,9,10,11],jump:[12,13,14,15]};
  const combat={block:[12],hit:[5,13],heavy:[8,9,10],light:[1,2,3],special:[2,6,3],super:[6,9,2],guard:[0,3,7,11],knockdown:[14],getup:[15],crouch:[15]};
  const fps={idle:5,walk:9,run:12,jump:10,block:8,hit:10,heavy:10,light:12,special:12,super:8,guard:7,knockdown:3,getup:6,crouch:5};
  const images=[];let ready=false,failed=0;
  function load(root='/assets/baba-danfo/'){
    root=root.replace(/\/$/,'')+'/';images.length=0;ready=false;failed=0;
    for(let i=0;i<32;i++){const im=new Image();im.onload=check;im.onerror=check;im.src=root+(i<16?'move_':'combat_')+String(i<16?i:i-16).padStart(2,'0')+'.png';images.push(im)}
    function check(){if(images.every(im=>im.complete)){failed=images.filter(im=>!im.naturalWidth).length;ready=failed===0;}}
    return images;
  }
  function state(p){
    if(p.hit>0||p.stun>.18)return 'hit';
    if(p.block)return 'block';
    if(p.attack>0)return p.attackType==='super'?'super':p.attackType==='special'?'special':p.attackType==='heavy'?'heavy':'light';
    if(!p.grounded)return 'jump';
    const speed=Math.abs(p.vx||0);return speed>175?'run':speed>8?'walk':'idle';
  }
  function draw(ctx,p){
    if(!ready)return false;
    const s=state(p),isMove=Object.prototype.hasOwnProperty.call(movement,s);
    const seq=(isMove?movement[s]:combat[s])||movement.idle;
    const frame=seq[Math.floor((p.walk||0)*(fps[s]||8))%seq.length];
    const img=images[isMove?frame:16+frame];if(!img||!img.naturalWidth)return false;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.dir||1,1);
    // Anchor at the fighter's feet; slightly smaller than the 160px source to match cast scale.
    const w=112,h=140;ctx.drawImage(img,-w/2,-h,w,h);
    if(p.superActive>0){ctx.globalAlpha=.28+Math.sin((p.walk||0)*12)*.1;ctx.strokeStyle=p.config?.color||'#f5ca39';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-h*.52,44,62,0,0,Math.PI*2);ctx.stroke();}
    if(s==='special'||s==='super'){ctx.globalAlpha=.7;ctx.strokeStyle=s==='super'?'#ffe47a':(p.config?.color||'#f5ca39');ctx.lineWidth=s==='super'?6:4;ctx.beginPath();ctx.arc(28,-58,40,-.7,.8);ctx.stroke();}
    ctx.restore();return true;
  }
  window.babaDanfoSprites={load,draw,get ready(){return ready},get failed(){return failed},state};
  load();
})();