/* Excel fayllarni brauzerda (IndexedDB) eslab qolish: sahifa yangilansa (F5) fayllar o'zi tiklanadi.
   Login ham, internet ham shart emas. Bulut (cloud.js) bilan birga ishlaydi. */
(()=>{
const DB='tmc_files',ST='f',SLOT={fs:'s',fd:'d',fp:'p',fh:'h',fm:'m',s_f:'sup'};
const open=()=>new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('IndexedDB yo\'q'));const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const run=(mode,fn)=>open().then(db=>new Promise((res,rej)=>{const t=db.transaction(ST,mode);let out;try{out=fn(t.objectStore(ST))}catch(e){return rej(e)}t.oncomplete=()=>res(out&&'result' in out?out.result:undefined);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
async function put(k,f,ts){try{const buf=await f.arrayBuffer();await run('readwrite',s=>s.put({name:f.name,type:f.type,buf,ts:ts||Date.now()},k))}catch(e){try{console.warn('fayl keshi:',e)}catch(x){}}}
const del=async k=>{try{await run('readwrite',s=>s.delete(k))}catch(e){}};
async function all(){try{const keys=await run('readonly',s=>s.getAllKeys()),out=[];for(const k of keys){const r=await run('readonly',s=>s.get(k));if(r)out.push(Object.assign({k},r))}return out}catch(e){return[]}}
const meta=async()=>{const m={};(await all()).forEach(r=>m[r.k]=r.ts);return m};
window.__fcache={put,del,all,meta};

/* saqlash: har qanday yuklash yo'li (umumiy tugma, yakka katakcha, sudrab tashlash) */
const kindOf=async f=>{try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',sheetRows:14});return window.__sniff&&window.__sniff(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null}))}catch(e){return null}};
async function keep(files){if(window.__restoring)return;for(const f of files){const k=await kindOf(f);if(k)put(k,f)}}
document.addEventListener('change',e=>{const t=e.target;if(!t||window.__restoring)return;
 if(t.id==='upf')keep([...t.files]);else if(SLOT[t.id]&&t.files&&t.files[0])put(SLOT[t.id],t.files[0])},true);
document.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files.length)keep([...e.dataTransfer.files])},true);

/* tiklash: sahifa ochilganda */
setTimeout(async()=>{const inp=document.getElementById('upf');if(!inp)return;
 const rows=(await all()).filter(r=>r.k!=='sup'&&!(typeof raw!=='undefined'&&raw[r.k]));if(!rows.length)return;
 const dt=new DataTransfer();rows.forEach(r=>dt.items.add(new File([r.buf],r.name||(r.k+'.xlsx'),{type:r.type||''})));
 window.__restoring=true;const st=document.getElementById('st');if(st)st.textContent='⏳ Fayllar brauzer xotirasidan tiklanmoqda…';
 inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{window.__restoring=false},2500)},0);
})();
