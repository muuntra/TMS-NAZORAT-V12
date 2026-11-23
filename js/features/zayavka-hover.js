/* Заявка katagi ustida hisob isboti (hover izoh) */
(()=>{
const fmt=v=>Math.round(v||0).toLocaleString('ru-RU').replace(/\u00a0/g,' '),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let tip=null,last=null;
const hide=()=>{last=null;if(tip)tip.style.display='none'};
const row=(a,b,c)=>'<div style="display:flex;justify-content:space-between;gap:16px"><span style="color:#a9b1da">'+a+'</span><b'+(c?' style="color:'+c+'"':'')+'>'+b+'</b></div>',hr='<div style="border-top:1px solid rgba(255,255,255,.14);margin:4px 0"></div>';
function tipW(it,w){const P=window.__ZP||{},d=it.dt&&it.dt[w];if(!d)return null;const q=it.zq?it.zq[w]:d.d0,z=it.z[w],tin=Math.max(0,d.d0-q),mn=Math.max(0,q-z);
 let h='<div style="font-weight:700;margin-bottom:5px">'+esc(it.name)+'<br><span style="color:#8a93c4;font-weight:500">'+w+'</span></div>';
 h+=row('Sotuv ('+P.P+' kun)',fmt(d.sl)+' dona')+row('Ehtiyoj ('+P.COV+'+'+P.LD+' kun)',fmt(d.nd)+' dona'+(d.nd!==d.ndR?' *':''))+row('Qoldiq (Доступно)',fmt(d.s0)+' dona');
 if(d.o||d.n)h+=row('Peremeshenya',(d.n?'+'+fmt(d.n):'')+(d.o?' −'+fmt(d.o):''));
 h+=row("Yo'lda"+(d.sus?' <span style="color:#fbbf24">(shubhali, hisobga olinmadi)</span>':''),fmt(d.trw)+' dona');
 h+=hr;
 if(d.d0>0)h+=row('Defitsit',fmt(d.nd)+' − '+fmt(d.s)+' − '+fmt(d.trc)+' = '+fmt(d.d0),'#fca5a5');
 else h+=row('Ortiqcha / yetarli',(d.s+d.trc-d.nd>0?'+'+fmt(d.s+d.trc-d.nd):'0')+' dona','#86efac');
 if(tin>0)h+=row('Boshqa filialdan olinadi','−'+fmt(tin));
 if(mn>0)h+=row('Asosiy ombordan olinadi','−'+fmt(mn));
 h+=row('ZAKUPGA',fmt(z)+' dona','#fbbf24');
 if(d.nd!==d.ndR)h+='<div style="color:#8a93c4;margin-top:4px">* tarix (XYZ) bo\'yicha tuzatilgan; oddiy hisobda '+fmt(d.ndR)+'</div>';return h}
function tipT(it){const W=['Андижан','Карши','Наманган','Самарканд','Ташкент','Фергана','Хорезм'];let h='<div style="font-weight:700;margin-bottom:5px">'+esc(it.name)+'</div>',dd=0,tin=0;
 W.forEach(w=>{const d=it.dt&&it.dt[w];if(!d)return;dd+=d.d0;tin+=Math.max(0,d.d0-(it.zq?it.zq[w]:d.d0));if(it.z[w]>0)h+=row(w,fmt(it.z[w])+' dona')});
 h+=hr+row('Filiallar defitsiti',fmt(dd));if(tin>0)h+=row('Filiallararo peremeshenya','−'+fmt(tin));const mn=Math.max(0,(it.zg||0)-(it.zn||0));if(mn>0)h+=row('Asosiy ombor','−'+fmt(mn));
 return h+row('ИТОГО zakup',fmt(it.zn)+' dona','#fbbf24')}
function place(e){if(!tip||tip.style.display!=='block')return;const W=tip.offsetWidth,H=tip.offsetHeight;let x=e.clientX+16,y=e.clientY+16;if(x+W>innerWidth-8)x=e.clientX-W-16;if(y+H>innerHeight-8)y=Math.max(8,innerHeight-H-8);tip.style.left=Math.max(8,x)+'px';tip.style.top=y+'px'}
document.addEventListener('mouseover',e=>{const td=e.target.closest&&e.target.closest('#out .zt tbody td');if(!td){if(last)hide();return}if(td===last)return;last=td;
 const t=td.closest('table'),c=td.cellIndex;if(!t.__g||t.__g[c]!=='Количество заявки'){if(tip)tip.style.display='none';return}
 let it=null;try{it=ITM[td.parentElement.cells[0].textContent.trim()]}catch(x){}if(!it){if(tip)tip.style.display='none';return}
 const nm=t.__h[c],html=nm==='Итого'?tipT(it):tipW(it,nm);if(!html){if(tip)tip.style.display='none';return}
 if(!tip){tip=document.createElement('div');tip.id='zhov';tip.style.cssText='position:fixed;z-index:99999;pointer-events:none;display:none;min-width:250px;max-width:340px;background:rgba(12,16,34,.97);color:#e8ecf6;border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:8px 11px;font:12px/1.55 system-ui,Segoe UI,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35)';document.body.appendChild(tip)}
 tip.innerHTML=html;tip.style.display='block';place(e)});
document.addEventListener('mousemove',place);const o=document.getElementById('out');if(o)o.addEventListener('scroll',hide,{passive:true});
})();
