/* Hamma excelni birdan yuklash: fayl turini avtomatik aniqlash, yetkazuvchilar ro'yxati */
(()=>{
const KEYS={s:'Продажа',d:'Остатки',h:'Ойлик история',m:'Динамика',p:'Перемещение',sup:'Yetkazuvchilar'},$=i=>document.getElementById(i);
function sniff(a){const t=a.slice(0,14).flat().map(c=>String(c==null?'':c)),h=s=>t.some(x=>x.includes(s));
 if(t.some(x=>x.trim()==='Поставщик')&&t.some(x=>/^ИД( ТМЦ)?$/.test(x.trim())))return'sup';if(h('Количество заказа'))return's';if(h('Количество продажи'))return'h';if(h('Сумма с переоценкой'))return'm';if(h('Название')&&h('Закупочная'))return'd';
 if(h('Откуда')&&h('Куда'))return'p';if(t.some(x=>x.trim()==='ТМЦ')&&t.some(x=>/^Склад\s/.test(x.trim())))return'p';return null}
window.__sniff=sniff;
const o0=window.run;let tm=0;
window.run=function(){if(window.__hold){window.__pend=1;return}clearTimeout(tm);const st=$('st');if(st)st.textContent='⏳ Hisoblanmoqda…';tm=setTimeout(()=>o0.apply(window,[]),40)};
async function many(files){const um=$('upm'),res=[],todo=[],supA=[];if(um)um.textContent='⏳ Fayllar o\'qilmoqda…';
 for(const f of files){try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',sheetRows:14}),a=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null}),k=sniff(a);if(k==='sup'){const w2=XLSX.read(await f.arrayBuffer(),{type:'array'});supA.push([f,XLSX.utils.sheet_to_json(w2.Sheets[w2.SheetNames[0]],{header:1,defval:null})])}else if(k)todo.push([f,k]);else res.push('✗ '+f.name+' (turi aniqlanmadi)')}catch(e){res.push('✗ '+f.name)}}
 const prev={};todo.forEach(([f,k])=>prev[k]=raw[k]);window.__hold=true;window.__pend=0;
 todo.forEach(([f,k])=>{try{rd(f,k)}catch(e){res.push('✗ '+f.name+': '+e.message)}res.push('✓ '+KEYS[k]+' ← '+f.name)});
 const t0=Date.now();await new Promise(r=>{const iv=setInterval(()=>{if(Date.now()-t0>25000||todo.every(([f,k])=>raw[k]!==prev[k])){clearInterval(iv);r()}},50)});
 if(supA.length){try{SUP.length=0;supA.forEach(([f,a])=>{const n=supImport(a);res.push(n<0?'✗ '+f.name+': «Поставщик» ustuni topilmadi':'✓ Yetkazuvchilar ← '+f.name+' ('+n+' qator, eski baza almashtirildi)')});supMaps()}catch(e){res.push('✗ yetkazuvchilar: '+e.message)}}
 window.__hold=false;if(todo.length)window.run();else if(supA.length&&typeof supChanged==='function')supChanged();if(um)um.textContent=res.join(' · ')}
const upb=$('upb');if(upb){const f=document.createElement('input');f.type='file';f.id='upf';f.multiple=true;f.accept='.xlsx,.xls';f.hidden=true;document.body.appendChild(f);
 const s=document.createElement('span');s.id='upm';(document.querySelector('.top .pt')||document.body).appendChild(s);upb.onclick=()=>f.click();f.onchange=e=>{many([...e.target.files]);f.value=''}}
addEventListener('dragover',e=>e.preventDefault());addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files.length){e.preventDefault();many([...e.dataTransfer.files])}});
})();
