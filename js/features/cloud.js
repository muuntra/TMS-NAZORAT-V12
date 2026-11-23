/* Bulut (Supabase): login, baza va Excel fayllarni avtomatik saqlash/tiklash.
   Offline-first: internet yoki login bo'lmasa ham tizim avvalgidek ishlayveradi. */
(()=>{
const C=window.TMC_CFG||{};if(!window.supabase||!C.url||!C.key)return;
const sb=window.supabase.createClient(C.url,C.key,{auth:{persistSession:true,autoRefreshToken:true}});
const KEYS=['tmc_sup','tmc_fin','tmc_plan','tmc_ctl','tmc_ko','tmc_sbc','tmc_brf'],BUCKET='uploads';
const NAMES={s:'Продажа',d:'Остатки',h:'Ойлик история',m:'Динамика',p:'Перемещение',sup:'Поставщик (yetkazuvchilar)'};
const XLSX_T='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
let user=null,applying=false,fromCloud=false;const timers={};
const getTs=()=>{try{return JSON.parse(localStorage.getItem('tmc_cloud_ts')||'{}')}catch(e){return{}}};
const setTs=o=>{try{localStorage.setItem('tmc_cloud_ts',JSON.stringify(o))}catch(e){}};

/* ---- ko'rinish ---- */
const btn=document.createElement('button');btn.className='t';btn.id='cl_btn';btn.textContent='☁ Kirish';
const acts=document.querySelector('.acts');if(acts)acts.insertBefore(btn,acts.firstChild);
const note=document.createElement('span');note.id='cl_st';note.className='rounded-full bg-[var(--hd)] px-2.5 py-1 text-xs text-[var(--mu)] empty:hidden';if(acts)acts.insertBefore(note,btn);
const say=(t,ms)=>{note.textContent=t;if(ms)setTimeout(()=>{if(note.textContent===t)note.textContent=''},ms)};
const paint=()=>{btn.textContent=user?('☁ '+(user.email||'').split('@')[0]):'☁ Kirish';btn.title=user?'Bosing: chiqish':'Bulutga kirish'};

function dialog(){
 if(document.getElementById('cl_dlg'))return;
 const d=document.createElement('div');d.id='cl_dlg';d.className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md animate-[clfade_.18s_both]';
 d.innerHTML=`<div class="max-h-[88vh] w-full overflow-auto rounded-3xl border border-[var(--bd)] bg-[var(--card)] p-5 text-[var(--tx)] shadow-2xl animate-[clpop_.26s_cubic-bezier(.2,1.2,.4,1)_both] max-w-sm"><h4 class="m-0 mb-1 text-lg font-bold tracking-tight">☁ Bulutga kirish</h4>
 <p class="mb-4 text-xs text-[var(--mu)]">Kirgandan keyin baza va Excel fayllar o'zi saqlanadi va keyingi safar o'zi tiklanadi.</p>
 <div class="grid gap-2.5"><input id="cl_em" type="email" autocomplete="username" placeholder="Email" class="w-full rounded-xl border border-[var(--bd)] bg-[var(--zb)] px-3.5 py-2.5 text-[var(--tx)] outline-none transition focus:border-[var(--ac)] focus:ring-4 focus:ring-[var(--ac)]/20"><input id="cl_pw" type="password" autocomplete="current-password" placeholder="Parol" class="w-full rounded-xl border border-[var(--bd)] bg-[var(--zb)] px-3.5 py-2.5 text-[var(--tx)] outline-none transition focus:border-[var(--ac)] focus:ring-4 focus:ring-[var(--ac)]/20"></div>
 <div id="cl_er" class="my-2 min-h-4 text-xs text-red-500"></div>
 <div class="flex justify-end gap-2"><button class="t rounded-xl! px-3! py-1.5! text-xs! whitespace-nowrap" id="cl_x">Bekor</button><button id="cl_ok" class="rounded-xl bg-gradient-to-br from-[var(--ac)] to-[var(--ac2)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--ac)]/30 transition hover:-translate-y-px hover:brightness-110 disabled:opacity-60">Kirish</button></div></div>`;
 document.body.appendChild(d);const $=i=>d.querySelector(i);$('#cl_em').focus();
 const close=()=>d.remove();$('#cl_x').onclick=close;d.addEventListener('mousedown',e=>{if(e.target===d)close()});
 const go=async()=>{$('#cl_er').textContent='';$('#cl_ok').disabled=true;
  const {error}=await sb.auth.signInWithPassword({email:$('#cl_em').value.trim(),password:$('#cl_pw').value});
  $('#cl_ok').disabled=false;
  if(error){$('#cl_er').textContent=/Invalid login/i.test(error.message)?"Email yoki parol noto'g'ri":("Xato: "+error.message);return}
  close()};
 $('#cl_ok').onclick=go;d.addEventListener('keydown',e=>{if(e.key==='Enter')go();if(e.key==='Escape')close()});
}
btn.onclick=async()=>{if(!user)return dialog();if(confirm('Bulutdan chiqasizmi? (Ma\'lumotlar bulutda saqlanib qoladi)'))await sb.auth.signOut()};

/* ---- baza (localStorage) ↔ bulut ---- */
const si=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){si.call(this,k,v);if(this===localStorage&&!applying&&KEYS.includes(k))push(k)};
function push(k,now){clearTimeout(timers[k]);
 const go=async()=>{if(!user)return;const v=localStorage.getItem(k);if(v==null)return;const t=new Date().toISOString();
  const {error}=await sb.from('app_state').upsert({user_id:user.id,key:k,value:v,updated_at:t});
  if(error)say('⚠ Bulutga saqlanmadi',6000);else{const lt=getTs();lt[k]=t;setTs(lt);say('☁ saqlandi ✓',2500)}};
 if(now)return go();timers[k]=setTimeout(go,1500)}
async function pullState(){
 const {data,error}=await sb.from('app_state').select('key,value,updated_at');if(error){say('⚠ Bulutdan o\'qib bo\'lmadi',6000);return false}
 const lt=getTs();let changed=false;
 for(const r of data){if(!KEYS.includes(r.key))continue;const l=lt[r.key];
  if(!l||new Date(r.updated_at)>new Date(l)){applying=true;try{localStorage.setItem(r.key,r.value)}catch(e){}applying=false;lt[r.key]=r.updated_at;changed=true}}
 setTs(lt);
 for(const k of KEYS){const v=localStorage.getItem(k),r=data.find(x=>x.key===k);
  if(v!=null&&(!r||(lt[k]&&new Date(lt[k])>new Date(r.updated_at))))await push(k,true)}
 return changed}

/* ---- Excel fayllar ↔ Storage ---- */
async function kindOf(f){try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',sheetRows:14});
 return window.__sniff&&window.__sniff(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null}))}catch(e){return null}}
async function upFiles(files){if(!user||fromCloud||window.__restoring)return;let n=0;
 for(const f of files){const k=await kindOf(f);if(!k)continue;
  const {error}=await sb.storage.from(BUCKET).upload(user.id+'/'+k+'.xlsx',f,{upsert:true,contentType:XLSX_T});if(!error)n++}
 if(n){say('☁ '+n+' ta fayl bulutga saqlandi ✓',4000);await listSrv();mark();supBar()}}
const SLOT={fs:'s',fd:'d',fp:'p',fh:'h',fm:'m',s_f:'sup'},recent=new Map();
const sig=f=>f.name+'|'+f.size+'|'+f.lastModified;
const fresh=fl=>fl.filter(f=>{const t=recent.get(sig(f));if(t&&Date.now()-t<4000)return false;recent.set(sig(f),Date.now());return true});
async function upSlot(k,f){if(!user||fromCloud||window.__restoring)return;const {error}=await sb.storage.from(BUCKET).upload(user.id+'/'+k+'.xlsx',f,{upsert:true,contentType:XLSX_T});
 if(error)say('⚠ Serverga saqlanmadi: '+error.message,6000);else{say('☁ '+(NAMES[k]||k)+' serverda yangilandi ✓',3500);await listSrv();mark();supBar()}}
document.addEventListener('change',e=>{const t=e.target;if(!t)return;
 if(t.id==='upf')upFiles(fresh([...t.files]));
 else if(SLOT[t.id]&&t.files&&t.files[0]){const f=t.files[0];if(fresh([f]).length)upSlot(SLOT[t.id],f)}},true);
document.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files.length)upFiles(fresh([...e.dataTransfer.files]))},true);

/* ---- o'chirish / almashtirish (serverdan ham) ---- */
let onSrv={};
async function listSrv(){if(!user)return onSrv={};const {data,error}=await sb.storage.from(BUCKET).list(user.id);if(error)return onSrv;
 onSrv={};(data||[]).forEach(o=>{const m=/^(\w+)\.xlsx$/.exec(o.name);if(m)onSrv[m[1]]=o});return onSrv}
async function delSrv(k){if(!user)return true;const {error}=await sb.storage.from(BUCKET).remove([user.id+'/'+k+'.xlsx']);
 if(error){say("⚠ Serverdan o'chirib bo'lmadi: "+error.message,7000);return false}delete onSrv[k];return true}
function clearLocal(k){try{if(window.__fcache)window.__fcache.del(k);if(k==='sup')return;raw[k]=null;FNM[k]='';const fn=document.getElementById('fn_'+k);if(fn){fn.textContent='📎 Tanlash uchun bosing';fn.className='fn'}
 const inp=document.getElementById('f'+k);if(inp)inp.value='';
 if(k==='s'||k==='d'){const st=document.getElementById('st');if(st)st.textContent='Avval 1 va 2-faylni tanlang: shundan keyin hamma bo\'lim hisoblanadi.'}
 if(raw.s&&raw.d)window.run();else if(typeof render==='function')render()}catch(e){console.error(e)}}
async function removeSlot(k){const nm=NAMES[k]||k,has=!!(raw[k]||onSrv[k]);if(!has)return;
 if(!confirm('«'+nm+"» faylini olib tashlaysizmi?"+(user?"\nServerdan ham o'chiriladi (qaytarib bo'lmaydi).":"")+(k==='sup'?"\nBazadagi yetkazuvchilar qoladi (ularni «Hammasini o'chirish» bilan tozalaysiz).":"")))return;
 if(user&&!(await delSrv(k)))return;clearLocal(k);say("🗑 «"+nm+"» o'chirildi"+(user?' (serverdan ham)':''),4000);mark();if(document.getElementById('cl_fm'))manager()}
async function dlSlot(k){const {data,error}=await sb.storage.from(BUCKET).download(user.id+'/'+k+'.xlsx');if(error||!data)return say('⚠ Yuklab bo\'lmadi',5000);
 const u=URL.createObjectURL(data),l=document.createElement('a');l.href=u;l.download=(NAMES[k]||k)+'.xlsx';l.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
async function importSup(f){try{const wb=xr(await f.arrayBuffer()),n=supImport(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null}));
 if(n<0){say('⚠ «Поставщик» ustuni topilmadi',6000);return false}supChanged();say('✓ Yetkazuvchilar yangilandi ('+n+' qator)',4000);return true}catch(e){say('⚠ '+e.message,6000);return false}}
function mark(){document.querySelectorAll('label.ft').forEach(l=>{const inp=l.querySelector('input[type=file]'),k=inp&&SLOT[inp.id];if(!k)return;let x=l.querySelector('.cl_x');
 if(!x){x=document.createElement('button');x.type='button';x.className='cl_x absolute right-2.5 bottom-2.5 z-[5] grid size-6 cursor-pointer place-items-center rounded-full border border-[var(--bd)] bg-[var(--card)] p-0! text-[11px] leading-none text-[var(--mu)] opacity-90 transition hover:rotate-90 hover:scale-110 hover:border-red-500 hover:bg-red-500 hover:text-white';x.textContent='✕';x.title="Olib tashlash (serverdan ham)";
  ['click','mousedown'].forEach(n=>x.addEventListener(n,ev=>{ev.preventDefault();ev.stopPropagation();if(n==='click')removeSlot(k)}));l.appendChild(x)}
 x.style.display=(raw[k]||onSrv[k])?'':'none'})}
function supBar(){const f=document.getElementById('s_f'),row=f&&(f.closest('[data-sup-ex]')||f.closest('.row'));let b=document.getElementById('cl_sf');
 if(!row){if(b)b.remove();return}
 if(!b){b=document.createElement('span');b.id='cl_sf';b.className='flex flex-wrap items-center gap-2 lg:col-span-2';row.appendChild(b)}
 const o=onSrv.sup,sz=o&&o.metadata&&o.metadata.size,dt=o&&(o.updated_at||o.created_at),key=user?(o?'1'+(dt||'')+sz:'0'):'x';
 if(b.dataset.k===key)return;b.dataset.k=key;
 if(!user){b.innerHTML='<span class="rounded-full bg-[var(--hd)] px-2 py-0.5 text-[11px] font-semibold text-[var(--mu)]">☁ Serverga saqlash uchun «☁ Kirish» ni bosing</span>';return}
 b.innerHTML=o?`<span class="rounded-full bg-green-600/15 px-2 py-0.5 text-[11px] font-semibold text-green-600">☁ serverda${sz?' · '+fsz(sz):''}${dt?' · '+new Date(dt).toLocaleString('ru-RU'):''}</span><button class="t rounded-xl! px-3! py-1.5! text-xs! whitespace-nowrap" data-sa="dl" title="Serverdagi faylni yuklab olish">⬇</button><button class="t rounded-xl! px-3! py-1.5! text-xs! whitespace-nowrap text-red-500! hover:border-red-500! hover:bg-red-500/10!" data-sa="rm">🗑 Serverdan o'chirish</button>`:'<span class="rounded-full bg-[var(--hd)] px-2 py-0.5 text-[11px] font-semibold text-[var(--mu)]">☁ serverda fayl yo\'q — Excel tanlang, o\'zi saqlanadi</span>';
 b.querySelectorAll('button[data-sa]').forEach(x=>x.onclick=()=>x.dataset.sa==='dl'?dlSlot('sup'):removeSlot('sup').then(()=>{b.dataset.k=''}))}
setInterval(()=>{mark();supBar()},1200);

/* ---- «Fayllar» oynasi: serverdagi fayllar, almashtirish, yuklab olish, o'chirish ---- */
const fbtn=document.createElement('button');fbtn.className='t';fbtn.id='cl_files';fbtn.textContent='🗂 Fayllar';fbtn.title='Serverdagi Excel fayllarni boshqarish';
if(acts)acts.insertBefore(fbtn,btn.nextSibling);
fbtn.onclick=()=>{if(!user)return dialog();manager()};
const fsz=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
const ICO={s:'🛒',d:'📦',p:'🔁',h:'📅',m:'📈',sup:'🚚'};
async function manager(){await listSrv();let d=document.getElementById('cl_fm');if(!d){d=document.createElement('div');d.id='cl_fm';d.className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md animate-[clfade_.18s_both]';
 d.addEventListener('mousedown',e=>{if(e.target===d)d.remove()});document.body.appendChild(d)}
 const rows=Object.keys(NAMES).map(k=>{const o=onSrv[k],sz=o&&o.metadata&&o.metadata.size,dt=o&&(o.updated_at||o.created_at);
  return `<div class="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-2xl border border-[var(--bd)] bg-[var(--hd)]/60 p-3 transition hover:-translate-y-px hover:border-[var(--ac)]/60 hover:shadow-md max-sm:grid-cols-[42px_1fr]${o?'':' opacity-80'}"><div class="grid size-[42px] place-items-center rounded-[13px] text-xl ring-1 ring-inset ${o?'bg-[var(--ac)]/15 ring-[var(--ac)]/25':'bg-[var(--hd)] ring-[var(--bd)] grayscale'}">${ICO[k]||'📄'}</div><div class="min-w-0"><div class="text-[13.5px] font-semibold">${NAMES[k]}</div>
  <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--mu)]">${o?'<span class="rounded-full bg-green-600/15 px-2 py-0.5 text-[11px] font-semibold text-green-600">☁ serverda</span>':'<span class="rounded-full bg-[var(--hd)] px-2 py-0.5 text-[11px] font-semibold text-[var(--mu)]">serverda yo\'q</span>'}${raw[k]?'<span class="rounded-full bg-[var(--ac)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--ac)]">brauzerda ✓</span>':''}${sz?'<span>'+fsz(sz)+'</span>':''}${dt?'<span>'+new Date(dt).toLocaleString('ru-RU')+'</span>':''}</div></div>
  <div class="flex items-center gap-1.5 max-sm:col-span-full max-sm:justify-end"><button class="t rounded-xl! px-3! py-1.5! text-xs! whitespace-nowrap" data-a="up" data-k="${k}">${o?'⟳ Almashtirish':'⬆ Yuklash'}</button>${o?`<button class="t rounded-xl! px-3! py-1.5! text-xs! whitespace-nowrap" data-a="dl" data-k="${k}" title="Yuklab olish">⬇</button>`:''}${(o||raw[k])?`<button class="t rounded-xl! px-3! py-1.5! text-xs! whitespace-nowrap text-red-500! hover:border-red-500! hover:bg-red-500/10!" data-a="rm" data-k="${k}">🗑 O'chirish</button>`:''}</div></div>`}).join('');
 d.innerHTML=`<div class="max-h-[88vh] w-full overflow-auto rounded-3xl border border-[var(--bd)] bg-[var(--card)] p-5 text-[var(--tx)] shadow-2xl animate-[clpop_.26s_cubic-bezier(.2,1.2,.4,1)_both] max-w-xl"><div class="mb-1 flex items-center gap-2.5"><h4 class="m-0 flex-1 text-lg font-bold tracking-tight">🗂 Serverdagi fayllar</h4><button class="t size-8 rounded-[10px]! p-0! leading-none" id="cl_fx" title="Yopish">✕</button></div><p class="mb-3.5 text-xs text-[var(--mu)]">Almashtirish, yuklab olish yoki serverdan o'chirish.</p><div class="grid gap-2">${rows}</div></div>`;
 d.querySelector('#cl_fx').onclick=()=>d.remove();
 d.addEventListener('keydown',e=>{if(e.key==='Escape')d.remove()});
 d.querySelectorAll('button[data-a]').forEach(b=>b.onclick=async()=>{const k=b.dataset.k,a=b.dataset.a;
  if(a==='rm')return removeSlot(k);
  if(a==='dl')return dlSlot(k);
  const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx,.xls';
  inp.onchange=async()=>{const f=inp.files[0];if(!f)return;
   if(k==='sup'){if(await importSup(f)){window.__fcache&&window.__fcache.put('sup',f);await upSlot('sup',f)}listSrv().then(()=>document.getElementById('cl_fm')&&manager());return}
   const t=document.getElementById('f'+k);if(!t)return;const dt=new DataTransfer();dt.items.add(f);t.files=dt.files;
   t.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{listSrv().then(()=>document.getElementById('cl_fm')&&manager())},1500)};inp.click()})}
async function loadFiles(){
 const {data,error}=await sb.storage.from(BUCKET).list(user.id);
 if(error){say('⚠ Fayllar ro\'yxati o\'qilmadi: '+error.message,7000);return}if(!data||!data.length)return;
 const mt=window.__fcache?await window.__fcache.meta():{},dt=new DataTransfer(),got=[];
 for(const o of data){const m=/^(\w+)\.xlsx$/.exec(o.name);if(!m||m[1]==='sup')continue;const k=m[1];
  const at=new Date(o.updated_at||o.created_at||0).getTime();
  if(raw[k]&&mt[k]&&at-mt[k]<60000)continue;   /* brauzerda bor va serverdagidan eski emas */
  const {data:b,error:e2}=await sb.storage.from(BUCKET).download(user.id+'/'+o.name);
  if(e2||!b){say('⚠ «'+(NAMES[k]||k)+'» yuklanmadi',6000);continue}
  const f=new File([b],(NAMES[k]||k)+'.xlsx',{type:XLSX_T});dt.items.add(f);got.push([k,f,at||Date.now()])}
 const inp=document.getElementById('upf');if(!inp||!dt.files.length)return;
 say('☁ fayllar bulutdan yuklanmoqda…');fromCloud=true;window.__restoring=true;
 got.forEach(([k,f,at])=>window.__fcache&&window.__fcache.put(k,f,at));
 inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));
 setTimeout(()=>{fromCloud=false;window.__restoring=false;say('☁ bulutdan tiklandi ✓',4000)},2500)}

/* ---- sessiya ---- */
let started=null;
async function onUser(u){user=u||null;paint();if(!user){started=null;onSrv={};mark();return}
 if(started===user.id)return;started=user.id;say('☁ sinxronlanmoqda…');
 const changed=await pullState();
 if(changed&&!sessionStorage.getItem('tmc_cl_rl')){sessionStorage.setItem('tmc_cl_rl','1');location.reload();return}
 sessionStorage.removeItem('tmc_cl_rl');await loadFiles();await listSrv();mark();say('')}
sb.auth.onAuthStateChange((ev,s)=>{setTimeout(()=>onUser(s&&s.user),0)});
sb.auth.getSession().then(({data})=>onUser(data.session&&data.session.user)).catch(()=>{});
window.__cloud={sb,push,pullState};
})();
