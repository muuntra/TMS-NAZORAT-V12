/* Yetkazuvchi bo'yicha buyurtma paneli va formulali Tmc_Zayavka Excel */
(()=>{
const $=i=>document.getElementById(i),fmt=v=>Math.round(v||0).toLocaleString('ru-RU').replace(/\u00a0/g,' '),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nz=s=>String(s==null?'':s).replace(/\s+/g,' ').trim().toLowerCase(),WF=['Андижан','Карши','Наманган','Самарканд','Ташкент','Фергана','Хорезм'],NO='⚠ Yetkazuvchi belgilanmagan';
function build(){if(!window.__ZR)return[];const SR=window.__ZSR,items=Object.values(ITM),NM={},LS={},own={},used=new Set(),G=[];
 items.forEach(it=>{const k=nz(it.name);(NM[k]||(NM[k]=[])).push(it)});
 SUP.forEach(s=>{if(!s||!s.sup||!s.name)return;const k=nz(s.name),L=LS[s.sup]||(LS[s.sup]={}),e=L[k]||(L[k]={name:s.name,mfr:s.mfr||'',ids:new Set(),q:0});e.ids.add(String(s.id||'').trim());e.q+=(+s.q||0);if(!own[k]||e.q>own[k].q)own[k]={sup:s.sup,q:e.q}});
 const Z7=()=>[0,0,0,0,0,0,0];
 const nid=v=>{const x=Number(v);return v!==''&&v!=null&&isFinite(x)?x:v},V=i=>(document.getElementById(i)||{}).value;
 const why=(it,st)=>{const W=Object.keys(it.dt||{}),L=[];let nd=0,s0=0,tr=0,d0=0,sl=0,tin=0,mn=0;
  W.forEach(w=>{const x=it.dt[w],q=it.zq?it.zq[w]:x.d0,t=Math.max(0,x.d0-q),m=Math.max(0,q-it.z[w]);nd+=x.nd;s0+=x.s0;tr+=x.trc;d0+=x.d0;sl+=x.sl;tin+=t;mn+=m;L.push(w+': sotuv '+x.sl+', ehtiyoj '+x.nd+', qoldiq '+x.s0+', yo\'lda '+x.trw+(x.sus?' (shubhali, hisobga olinmadi)':'')+' → defitsit '+x.d0+(t?', boshqa filialdan '+t:'')+(m?', asosiy ombordan '+m:'')+' → zakup '+it.z[w])});
  const zn=+it.zn||0,cs=+it.cs||0,pc=cs?Math.round(zn/cs*100):0,Z=+V('zmin')||0,M=+V('minc')||25;let sh;
  if(zn>0&&cs&&st==='Меньше кейса')sh='Z-qoida: kerak '+zn+' dona, kesh '+cs+' ('+pc+'% < '+Z+'%) — zakaz qilinmaydi';
  else if(zn>0&&cs&&/Мало для кейса/.test(st))sh='Kam sotiladi: kerak '+zn+' dona, kesh '+cs+' ('+pc+'% < '+M+'%) — zakaz qilinmaydi';
  else if(zn>0)sh='Kerak '+zn+' dona, lekin zakaz hisoblanmadi ('+st+')';
  else if(!sl)sh='Davrda sotuv yo\'q (qoldiq '+s0+')';
  else if(!d0)sh='Qoldiq yetarli: ehtiyoj '+nd+', qoldiq '+s0+(tr?', yo\'lda '+tr:'');
  else sh='Defitsit '+d0+' ichki yopildi (filiallararo '+tin+', asosiy ombor '+mn+')';
  return[sh,sh+'\n'+L.join('\n')+(zn>0&&cs&&(st==='Меньше кейса'||/Мало/.test(st))?'\n\nZakaz qilish uchun «Z uchun min. kesh %» / «Min. kesh %» ni kamaytiring yoki qo\'lda buyuring.':'')]};
 const mk=(it,e,sup,sec,flag)=>{const ids=e?[...e.ids].filter(Boolean):[],app=e?(NM[nz(e.name)]||[]):[],f=[];let r,note='',wy='';
  if(flag)f.push(flag);else{if(app.length>1||ids.length>1)f.push('Дубликат');else if(it&&ids.length===1&&ids[0]!==String(it.id))f.push('ID boshqa (ro\'yxatda '+ids[0]+')');if(!it)f.push('Ostatka va sotuvda yo\'q')}
  if(it){r=window.__ZR(it).slice();r[34+(window.__ZSR?1:0)]=(it.abc||'')+(it.xyz||'')}else{const id=nid(ids[0]||''),nm=e.name,mf=e.mfr;r=[id,nm,mf,...Z7(),'',id,nm,mf,...Z7(),'',id,nm,mf,...Z7(),0,'',...(SR?['']:[]),'','','',0,0,'','',sup]}
  const n=r.length;let sal=0,stt=0,has=false;
  if(it){sal=Object.values(it.sales||{}).reduce((a,b)=>a+(+b||0),0);stt=Object.values(it.st||{}).reduce((a,b)=>a+(+b||0),0);const zn0=+r[32]||0;has=sal>0||stt>0||zn0>0;if(!has&&!sec&&!flag)f.push('Ostatka va sotuvda yo\'q');
   if(zn0>0&&!(+it.cs)&&!sec){r[n-4]=zn0;r[n-2]='Kesh hajmi yo\'q: ehtiyoj '+zn0+' dona (qo\'lda buyuring)'}
   const w=why(it,r[n-2]);note=w[1];
   if(sec){wy='Zakup '+own[nz(e.name)].sup+' buyurtmasida'+(zn0?' (kerak '+zn0+' dona)':'');for(let j=25;j<=32;j++)r[j]=0;r[n-5]=0;r[n-4]=0;r[n-3]=''}
   else if(!(+r[n-4]>0))wy=has?w[0]:''}
  r[0]=nid(r[0]);r[11]=nid(r[11]);r[22]=nid(r[22]);
  r[n-1]=sup;r[n-2]=[...f,wy||r[n-2]].filter(Boolean).join(' · ');return{r,id:r[0],name:r[1],cost:it?(it.cost||0):0,q:+r[n-4]||0,zn:+r[32]||0,sal,has,note}};
 Object.keys(LS).forEach(sup=>{const rows=[];Object.keys(LS[sup]).forEach(k=>{const e=LS[sup][k],ap=NM[k]||[],sec=own[k].sup!==sup;if(ap.length)ap.forEach(it=>{rows.push(mk(it,e,sup,sec));if(!sec)used.add(it)});else rows.push(mk(null,e,sup,sec))});G.push({n:sup,rows})});
 const un=items.filter(it=>!used.has(it)&&(it.ordq>0||it.zn>0));if(un.length)G.push({n:NO,rows:un.map(it=>mk(it,null,NO,false,'Yetkazuvchi ro\'yxatida yo\'q'))});
 G.forEach(g=>{const rk=x=>(x.q>0||x.zn>0)?0:(x.has?1:2);g.rows.sort((a,b)=>rk(a)-rk(b)||(rk(a)===0?(b.zn-a.zn||b.q-a.q):rk(a)===1?b.sal-a.sal:0)||String(a.name).localeCompare(b.name));g.q=g.rows.reduce((a,x)=>a+x.q,0);g.sum=g.rows.reduce((a,x)=>a+x.q*x.cost,0);g.need=g.rows.filter(x=>x.q>0||x.zn>0).length});
 return G.sort((a,b)=>(b.n===NO)-(a.n===NO)||b.sum-a.sum||a.n.localeCompare(b.n))}
const tg=g=>{const L=g.rows.filter(x=>x.q>0);return['📦 Buyurtma — '+g.n,'Sana: '+new Date().toLocaleDateString('ru-RU'),'',...L.map((x,i)=>{const n=x.r.length,br=WF.map((w,j)=>x.r[25+j]>0?w+' '+fmt(x.r[25+j]):'').filter(Boolean).join(', ');return(i+1)+'. '+x.name+' — '+fmt(x.q)+' dona'+(x.r[n-5]?' ('+x.r[n-5]+' kesh)':'')+(br?'\n   '+br:'')}),'','Jami: '+L.length+' pozitsiya, '+fmt(g.q)+' dona'].join('\n')};
function copy(t,b){const ok=()=>{b.textContent='✓ Nusxalandi';setTimeout(()=>b.textContent='📋 Telegram',1500)},fb=()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove();ok()};try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}}
function save(buf,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000)}
const colL=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=(n-m-1)/26|0}return s};
const fxCases=(zn,cs,abc,xyz,mi,zm)=>{if(!(cs>0)||!(zn>0))return 0;const r=zn/cs;let k=Math.ceil(+r.toFixed(9));if(zm>0&&xyz==='Z'){const f=Math.floor(r),d=r-f;k=d<1e-9?f:(d>=zm-1e-9?f+1:f)}if(['CZ','CY','CX','BZ'].includes(abc+xyz)&&r<mi)k=0;return k};window.__fxCases=fxCases;
function fxRows(g,S,par){const cm=j=>j<=34+S?3+j:4+j,L=j=>colL(cm(j)),zc0=L(25),zc1=L(31),I=L(32),CS=L(35+S),NB=L(36+S),CO=L(37+S),QS=L(38+S),EX=L(39+S),NR=L(42+S),SM=L(43+S),A=colL(37+S),X=colL(38+S);
 return g.rows.map((x,i)=>{const r=x.r.slice(),n=r.length,w=4+i,zn=+r[32]||0,cs=+r[35+S]||0,cls=String(r[34+S]||''),abc=/^[ABC]/.test(cls)?cls[0]:'',xyz=/[XYZ]$/.test(cls)?cls.slice(-1):'',k=fxCases(zn,cs,abc,xyz,par.minc,par.zmin),
  q=!k&&!cs&&zn>0?zn:k*cs,rat=`${I}${w}/${CS}${w}`,ZM='Parametrlar!$B$7',MI='Parametrlar!$B$6',sg=`${A}${w}&${X}${w}`,
  kx=`IF(AND(${ZM}>0,${X}${w}="Z"),IF(${rat}-INT(${rat})<0.000000001,INT(${rat}),IF(${rat}-INT(${rat})>=${ZM}-0.000000001,INT(${rat})+1,INT(${rat}))),ROUNDUP(ROUND(${rat},9),0))`,
  low=`AND(OR(${sg}="CZ",${sg}="CY",${sg}="CX",${sg}="BZ"),${rat}<${MI})`;
  r[32]={formula:`SUM(${zc0}${w}:${zc1}${w})`,result:zn};
  r[36+S]={formula:`IF(N(${CS}${w})>0,${I}${w}/${CS}${w},"")`,result:cs?zn/cs:''};
  r[37+S]={formula:`IFERROR(IF(OR(N(${CS}${w})<=0,N(${I}${w})<=0,${low}),"",IF(${kx}=0,"",${kx})),"")`,result:k||''};
  r[38+S]={formula:`IF(N(${CO}${w})>0,${CO}${w}*${CS}${w},IF(AND(N(${CS}${w})<=0,N(${I}${w})>0),${I}${w},0))`,result:q};
  r[39+S]={formula:`IF(N(${QS}${w})>0,${QS}${w}-${I}${w},"")`,result:q>0?q-zn:''};
  r[42+S]=x.cost||0;r[43+S]={formula:`N(${QS}${w})*N(${NR}${w})`,result:q*(x.cost||0)};
  x.fxq=q;return r})}
async function xl(gs,fname,btn){const base=defs.find(d=>d.grp&&d.tab==='Заявка');if(!base){alert('Avval fayllarni yuklang');return}const t0=btn&&btn.textContent;if(btn)btn.textContent='⏳';await new Promise(r=>setTimeout(r,30));
 const S=window.__ZSR?1:0,V=i=>(document.getElementById(i)||{}).value,P=window.__ZP||{},par={per:P.P,cov:P.COV,lead:P.LD,coef:P.coef,minc:(+V('minc')||25)/100,zmin:(+V('zmin')||0)/100};
 const u=new Set(),nm=g=>{let n=g.n.replace(/[\\\/?*\[\]:'"]/g,' ').replace(/\s+/g,' ').trim().slice(0,28)||'List',m=n,c=1;while(u.has(m.toLowerCase()))m=n.slice(0,26)+'_'+(++c);u.add(m.toLowerCase());return m};
 const bak=defs.slice();let data;try{defs.length=0;gs.forEach(g=>defs.push(Object.assign({},base,{fx:par,hd:[...base.hd,"Narx, so'm","Summa, so'm"],sn:nm(g),rows:fxRows(g,S,par),tips:g.rows.map(x=>x.note?{[x.r.length-2]:x.note}:{})})));data=await buildXlsx('Заявка')}catch(e){alert('Excel tayyorlanmadi: '+e.message)}finally{defs.length=0;bak.forEach(d=>defs.push(d))}
 if(data)save(data,fname);if(btn)btn.textContent=t0}
window.__xl=xl;
function open(){const G=build();let p=$('sopan');if(!p){p=document.createElement('div');p.id='sopan';document.body.appendChild(p);p.addEventListener('click',e=>{if(e.target===p||e.target.id==='sox')p.remove()})}
 if(!G.length){p.innerHTML='<div class="bx">Avval fayllarni (va yetkazuvchilar ro\'yxatini) yuklang.<p><button id="sox">Yopish</button></p></div>';return}
 window.__SG=G;const T=G.reduce((a,g)=>a+g.sum,0),N=G.reduce((a,g)=>a+g.rows.length,0);
 p.innerHTML='<div class="bx"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:15px">📦 Yetkazuvchi bo\'yicha buyurtmalar</b><span><button id="sall">⬇ Hammasi (Tmc_Zayavka)</button><button id="sox" style="background:#64748b">✕</button></span></div><div style="color:var(--mu);font-size:11px;margin:2px 0 6px">'+G.length+' guruh · '+N+' tovar (ro\'yxatdagi hammasi) · zakup '+fmt(T)+' so\'m. '+(SUP.length?'':'<b style="color:#dc2626">Yetkazuvchilar bazasi bo\'sh: «📂 Excel yuklash» bilan ro\'yxatni ham tanlang.</b>')+'</div>'+
 G.map((g,i)=>'<details'+(g.n===NO?' open':'')+'><summary><span>'+esc(g.n)+'</span><span>'+g.need+' zakaz / '+g.rows.length+' tovar · '+fmt(g.sum)+' so\'m</span></summary><div style="margin-top:6px"><button data-tg="'+i+'">📋 Telegram</button><button data-xl="'+i+'">⬇ Excel (Tmc_Zayavka)</button></div><div style="overflow:auto"><table><tr><th>ИД</th><th>Tovar</th>'+WF.map(w=>'<th title="'+w+'">'+w.slice(0,3)+'</th>').join('')+'<th>Итого</th><th>Kesh</th><th>Dona</th><th>Holat</th></tr>'+g.rows.map(x=>{const n=x.r.length;return'<tr'+(x.q>0||x.zn>0?'':' style="opacity:.5"')+'><td>'+esc(x.id)+'</td><td>'+esc(x.name)+'</td>'+WF.map((w,j)=>'<td'+(x.r[25+j]>0?' style="font-weight:700"':'')+'>'+(x.r[25+j]||'')+'</td>').join('')+'<td><b>'+(x.zn||'')+'</b></td><td>'+(x.r[n-5]||'')+'</td><td>'+(x.q?fmt(x.q):'')+'</td><td style="text-align:left;white-space:nowrap;color:#b45309">'+esc(x.r[n-2]).slice(0,60)+'</td></tr>'}).join('')+'</table></div></details>').join('')+'</div>'}
document.addEventListener('click',e=>{const b=e.target;if(!b.dataset)return;const G=window.__SG||[],d=new Date().toISOString().slice(0,10);
 if(b.dataset.tg!=null)copy(tg(G[+b.dataset.tg]),b);
 if(b.dataset.xl!=null){const g=G[+b.dataset.xl];xl([g],'Tmc_Zayavka_'+g.n.replace(/[^\wа-яА-Я]+/g,'_').replace(/^_+|_+$/g,'').slice(0,30)+'_'+d+'.xlsx',b)}
 if(b.id==='sall')xl(G,'Tmc_Zayavka_yetkazuvchilar_'+d+'.xlsx',b)});
const ac=document.querySelector('.acts'),upb=$('upb');if(ac&&upb){const b=document.createElement('button');b.id='sob';b.className='t';b.textContent='📦 Buyurtma';b.title='Yetkazuvchi bo\'yicha tayyor buyurtma (Tmc_Zayavka Excel / Telegram)';b.onclick=open;ac.insertBefore(b,upb.nextSibling)}
const pt=document.querySelector('.top .pt');if(pt){const l=document.createElement('span');l.id='lg';l.innerHTML='<b style="color:#dc2626">■</b> qoldiq 0, sotuv bor &nbsp; <b style="color:#f59e0b">■</b> qoldiq ehtiyojdan 2× ko\'p';pt.appendChild(l)}
})();
/* ===== Reja tahlili: foizlar, grafiklar, pik va hozir ===== */
