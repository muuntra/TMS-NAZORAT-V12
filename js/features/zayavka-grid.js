/* Заявка jadvali: klaviatura bilan yurish, ustunlarni yashirish/birlashtirish, filial filtri, sarlavha tugmalari */
(()=>{
const O=()=>document.querySelector('#out'),T=()=>{const o=O();return o&&o.querySelector('table')},S={ar:0,ac:0,r:0,c:0,on:false};
const vis=()=>{const t=T();return t?[...t.tBodies[0].rows].filter(r=>r.offsetParent!==null):[]},nC=()=>{const V=vis();return V[0]?V[0].cells.length:0},cell=(r,c)=>{const R=vis()[r];return R&&R.cells[c]},inpOf=x=>x&&x.querySelector('input.ko');
function paint(){const t=T();if(!t)return;t.querySelectorAll('.sel,.cur').forEach(e=>e.classList.remove('sel','cur'));if(!S.on)return;
 const V=vis(),r0=Math.min(S.ar,S.r),r1=Math.max(S.ar,S.r),c0=Math.min(S.ac,S.c),c1=Math.max(S.ac,S.c);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const x=V[r]&&V[r].cells[c];if(x)x.classList.add('sel')}
 const x=cell(S.r,S.c);if(x){x.classList.add('cur');x.scrollIntoView({block:'nearest',inline:'nearest'})}}
const hid=x=>!x||x.offsetParent===null;
function mv(dr,dc,ext){const V=vis(),n=nC();if(!V.length)return;S.r=Math.max(0,Math.min(V.length-1,S.r+dr));S.c=Math.max(0,Math.min(n-1,S.c+dc));const row=V[S.r],d=dc<0?-1:1;let g=0;while(row&&hid(row.cells[S.c])&&g++<60){const nc=S.c+d;if(nc<0||nc>=n)break;S.c=nc}if(!ext){S.ar=S.r;S.ac=S.c}paint()}
document.addEventListener('keydown',e=>{
 if(!T())return;const a=document.activeElement;
 if(a&&a.classList&&a.classList.contains('ko')){
  if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();const dr=e.key==='Enter'?(e.shiftKey?-1:1):0,dc=e.key==='Tab'?(e.shiftKey?-1:1):0;if(a.value!==a.defaultValue)a.dispatchEvent(new Event('change',{bubbles:true}));a.blur();setTimeout(()=>mv(dr,dc,false),40)}
  else if(e.key==='Escape'){a.value=a.defaultValue;a.blur()}return}
 if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 const k=e.key,M={ArrowDown:[1,0],ArrowUp:[-1,0],ArrowRight:[0,1],ArrowLeft:[0,-1],PageDown:[20,0],PageUp:[-20,0],Home:[0,-999],End:[0,999]};
 if(k==='Tab'){e.preventDefault();S.on=true;mv(0,e.shiftKey?-1:1,false);return}
 if(M[k]){e.preventDefault();S.on=true;mv(M[k][0],M[k][1],e.shiftKey);return}
 if(!S.on)return;const i=inpOf(cell(S.r,S.c));
 if(k==='Enter'||k==='F2'){e.preventDefault();if(i){i.focus();i.select()}else mv(1,0,false);return}
 if(i&&/^[0-9]$/.test(k)){e.preventDefault();i.focus();i.value=k;return}
 if(i&&(k==='Delete'||k==='Backspace')){e.preventDefault();i.value='0';i.dispatchEvent(new Event('change',{bubbles:true}))}});
let dn=false;
document.addEventListener('mousedown',e=>{const td=e.target.closest&&e.target.closest('#out tbody td');if(!td)return;const r=vis().indexOf(td.parentElement);if(r<0)return;S.on=true;const c=td.cellIndex;if(e.shiftKey){S.r=r;S.c=c}else{S.ar=S.r=r;S.ac=S.c=c;dn=!e.target.closest('input')}paint()});
document.addEventListener('mouseover',e=>{if(!dn||!(e.buttons&1))return;const td=e.target.closest&&e.target.closest('#out tbody td');if(!td)return;const r=vis().indexOf(td.parentElement);if(r<0)return;S.r=r;S.c=td.cellIndex;paint()});
document.addEventListener('mouseup',()=>{dn=false});
document.addEventListener('copy',e=>{if(!S.on||!T())return;const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA)$/.test(a.tagName))return;
 const V=vis(),r0=Math.min(S.ar,S.r),r1=Math.max(S.ar,S.r),c0=Math.min(S.ac,S.c),c1=Math.max(S.ac,S.c),out=[];
 for(let r=r0;r<=r1;r++){const row=[];for(let c=c0;c<=c1;c++){const x=V[r]&&V[r].cells[c];if(!x||hid(x))continue;const i=x.querySelector('input');row.push((i?i.value:x.textContent).replace(/\s+/g,' ').trim())}out.push(row.join('\t'))}
 const tx=out.join('\n');e.clipboardData.setData('text/plain',tx);e.preventDefault();window.__copied=tx});
const WNN=['Андижан','Карши','Наманган','Самарканд','Ташкент','Фергана','Хорезм'];
function applyCols(){const t=T();if(!t||!t.__hid)return;const sel=(document.getElementById('brf')||{}).value||'',H=new Set(t.__hid);t.__h.forEach((s,k)=>{if(sel&&WNN.includes(s)&&s!==sel)H.add(k)});
 let st=document.getElementById('hc');if(!st){st=document.createElement('style');st.id='hc';document.head.appendChild(st)}
 st.textContent=[...H].map(k=>'.zt .h2 th:nth-child('+(k+1)+'),.zt tbody td:nth-child('+(k+1)+')').join(',')+'{display:none}'+(t.__cr||'');
 t.__GS.forEach(g=>{let n=0;for(let k=g.s;k<g.s+g.n;k++)if(!H.has(k))n++;g.th.colSpan=Math.max(1,n)})}
function fix(){const t=T();if(!t||t.dataset.cz||!t.tHead||!t.tBodies[0])return;const hr=t.tHead.querySelector('tr.h2')||t.tHead.rows[t.tHead.rows.length-1];if(!hr)return;
 const tx=[...hr.cells].map(h=>h.textContent.replace('▾','').trim());const G=[];[...t.tHead.rows[0].cells].forEach(th=>{const n=th.colSpan,nm=th.textContent.trim();for(let k=0;k<n;k++)G.push(nm)});let gi=0;const GS=[...t.tHead.rows[0].cells].map(th=>{const n=th.colSpan,s=gi;gi+=n;return {th,s,n}});GS[0].s++;GS[0].n--;if(tx[0]!=='ИД'||tx[1]!=='Продукция')return;
 const hid=new Set([1]);tx.forEach((s,i)=>{if(i>1&&(s==='ИД'||s==='Продукция'))hid.add(i)});
 let i=0;[...t.tHead.rows[0].cells].forEach(th=>{const n=th.colSpan;let h=0;for(let k=i;k<i+n;k++)if(hid.has(k))h++;if(h&&h<n)th.colSpan=n-h;i+=n});{const r0=t.tHead.rows[0],g0=r0.cells[0];if(g0&&g0.colSpan>1){g0.colSpan--;const c=document.createElement('th');c.className='gc';r0.insertBefore(c,g0)}}
 for(const r of t.tBodies[0].rows){if(r.cells[1])r.cells[0].dataset.nm=r.cells[1].textContent.trim()}
 let st=document.getElementById('hc');if(!st){st=document.createElement('style');st.id='hc';document.head.appendChild(st)}
 const WN=['Андижан','Карши','Наманган','Самарканд','Ташкент','Фергана','Хорезм'],cr=tx.map((s,k)=>G[k]==='Количество заявки'&&(WN.includes(s)||s==='Итого')?'.zt tbody td:nth-child('+(k+1)+')':'').filter(Boolean).join(',');
 t.__cr=cr?cr+'{cursor:help;text-decoration:underline dotted rgba(120,130,170,.55);text-underline-offset:3px}':'';t.__hid=hid;t.__GS=GS;t.__g=G;t.__h=tx;applyCols();
 try{const R=t.tBodies[0].rows;for(let r=0;r<R.length;r++){const it=ITM[R[r].cells[0].textContent.trim()];if(!it||!it.dt)continue;tx.forEach((s,k)=>{if(G[k]!=='Остаток'||!WN.includes(s))return;const d=it.dt[s];if(!d)return;const c=R[r].cells[k];if(d.s0<=0&&d.sl>0)c.classList.add('rk');else if(d.nd>0&&d.s0>2*d.nd)c.classList.add('ov')})}}catch(e){}
 t.dataset.cz=1}
new MutationObserver(()=>{if(!T()){S.on=false;return}fix();if(S.on)paint()}).observe(O(),{childList:true});
const mc=document.querySelector('.mc'),st=document.getElementById('st'),ac=document.querySelector('.acts');
if(ac){const mk=(id,t,ti)=>{const b=document.createElement('button');b.id=id;b.className='t';b.textContent=t;b.title=ti;return b};
 const up=mk('upb','📂 Excel yuklash','Hamma excel fayllarni birdan tanlang yoki sahifaga sudrab tashlang'),pm=mk('ftog','⚙','Fayllar va hisob parametrlari (ochish / yopish)'),kb=mk('kbh','⌨','Klaviatura: ↑↓←→ yurish · Shift+strelka tanlash · Ctrl+C nusxa · Enter/F2 yoki raqam — kesh tahrirlash · Esc bekor');
 const sl=document.createElement('select');sl.id='brf';sl.title='Faqat bitta filialni ko\'rsatish';sl.innerHTML='<option value="">Hamma filial</option>'+WNN.map(w=>'<option>'+w+'</option>').join('');try{sl.value=localStorage.getItem('tmc_brf')||''}catch(e){}sl.onchange=()=>{try{localStorage.setItem('tmc_brf',sl.value)}catch(e){}applyCols()};
 ac.insertBefore(sl,ac.firstChild);ac.insertBefore(kb,ac.firstChild);ac.insertBefore(pm,kb);ac.insertBefore(up,pm);pm.onclick=()=>mc&&mc.classList.toggle('hf')}
if(mc&&st)new MutationObserver(()=>{if(!window.__hfd&&/Hisoblandi/.test(st.textContent)){window.__hfd=1;mc.classList.add('hf')}}).observe(st,{childList:true,characterData:true,subtree:true})
})();
