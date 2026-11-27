/* Baba Danfo ZIP-backed sprite animation loader. Keeps procedural renderer as fallback until sheets load. */
(() => {
  const ZIP_URL = '/baba_danfo_processed_asset_pack.zip';
  const SIZE = { w: 128, h: 160 };
  const STRIPS = {
    idle: 'idle_frames_128x160.png', walk: 'walk_frames_128x160.png',
    run: 'run_frames_128x160.png', jump: 'jump_frames_128x160.png',
    block: 'guard_frames_128x160.png', light: 'light_punch_frames_128x160.png',
    heavy: 'heavy_punch_frames_128x160.png', kick: 'kick_frames_128x160.png',
    sweep: 'sweep_frames_128x160.png', hit: 'hit_reaction_frames_128x160.png',
    knockdown: 'knockdown_frames_128x160.png', getup: 'get_up_frames_128x160.png',
    dash: 'danfo_dash_frames_128x160.png', special: 'danfo_strike_frames_128x160.png',
    uppercut: 'uppercut_frames_128x160.png', super: 'super_frames_128x160.png',
    victory: 'victory_frames_128x160.png', defeat: 'defeat_frames_128x160.png',
    vfx: 'vfx_frames_128x160.png'
  };
  const fps = {idle:8,walk:10,run:12,jump:9,block:8,light:12,heavy:10,kick:10,sweep:10,hit:10,knockdown:8,getup:8,dash:12,special:10,uppercut:10,super:9,victory:8,defeat:8};
  const counts = {};
  const images = {};
  let ready = false, failed = false, loadPromise;
  async function unzip() {
    const res = await fetch(ZIP_URL);
    if (!res.ok) throw new Error('Sprite pack HTTP '+res.status);
    const bytes = await res.arrayBuffer(), dv = new DataView(bytes), u8 = new Uint8Array(bytes);
    const entries = new Map(); let off=0;
    while (off+30 < bytes.byteLength && dv.getUint32(off,true)===0x04034b50) {
      const method=dv.getUint16(off+8,true), csize=dv.getUint32(off+18,true), nlen=dv.getUint16(off+26,true), elen=dv.getUint16(off+28,true);
      const name=new TextDecoder().decode(u8.slice(off+30,off+30+nlen));
      const start=off+30+nlen+elen, compressed=u8.slice(start,start+csize);
      if (STRIPS && Object.values(STRIPS).includes(name)) {
        let raw=compressed;
        if(method===8) {
          if(!window.DecompressionStream) throw new Error('Browser ZIP decompression is unsupported');
          const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
          raw=new Uint8Array(await new Response(stream).arrayBuffer());
        } else if(method!==0) throw new Error('Unsupported ZIP compression '+method);
        const blob=new Blob([raw],{type:'image/png'}), img=new Image();
        img.src=URL.createObjectURL(blob); await img.decode();
        images[name]=img; counts[name]=Math.max(1,Math.round(img.width/SIZE.w));
      }
      off=start+csize;
    }
    ready=Object.keys(images).length>=10;
  }
  function choose(p) {
    if(p.hp<=0 || p.defeated) return 'defeat';
    if(p.knockdown || p.down) return 'knockdown';
    if(p.gettingUp || p.getUp) return 'getup';
    if(p.hit>0 || p.stun>.18) return 'hit';
    if(p.block) return 'block';
    if(p.attack>0) {
      const a=p.attackType||'light';
      if(a==='super') return 'super';
      if(a==='special') return p.moveIndex===3?'uppercut':'special';
      if(a==='heavy') return 'heavy';
      if(a==='kick') return 'kick';
      return 'light';
    }
    if(p.grounded===false) return 'jump';
    if(Math.abs(p.vx||0)>230) return 'dash';
    if(Math.abs(p.vx||0)>175) return 'run';
    if(Math.abs(p.vx||0)>8) return 'walk';
    return 'idle';
  }
  function draw(ctx,p) {
    if(!ready) return false;
    const state=choose(p), file=STRIPS[state]||STRIPS.idle, img=images[file];
    if(!img) return false;
    const n=counts[file]||1, time=(p.walk||0);
    let idx=Math.floor(time*(fps[state]||8))%n;
    if(state==='light'||state==='heavy'||state==='kick'||state==='sweep'||state==='special'||state==='uppercut'||state==='super'||state==='hit'||state==='getup') {
      const total=state==='super'?(p.attackDuration||1.02):state==='special'?.38:state==='heavy'?.42:.28;
      const remaining=Math.max(0,p.attack||p.stun||0);
      const progress=remaining>0?Math.max(0,Math.min(1,1-remaining/total)):1;
      idx=Math.min(n-1,Math.floor(progress*n));
    }
    const scale=1.28, width=SIZE.w*scale, height=SIZE.h*scale, x=p.x, y=p.y;
    ctx.save();ctx.translate(x,y);ctx.scale((p.dir||1),1);
    ctx.globalAlpha=p.flash>0?.72:1;
    ctx.drawImage(img,idx*SIZE.w,0,SIZE.w,SIZE.h,-width/2,-height,width,height);
    ctx.restore();
    return true;
  }
  window.babaDanfoSprites = {draw,get ready(){return ready},get failed(){return failed},state:choose};
  loadPromise=unzip().catch(e=>{failed=true;console.warn('[Baba sprites] Falling back to procedural art:',e);});
  window.babaDanfoSpriteLoad=loadPromise;
})();