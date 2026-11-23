/* Sahifa sarlavhasini body[data-tab] ga yozish (CSS uchun) */
(()=>{const pt=document.getElementById('pt');if(!pt)return;const s=()=>{document.body.dataset.tab=pt.textContent.trim()};s();new MutationObserver(s).observe(pt,{childList:true,characterData:true,subtree:true})})();
/* Mobilda yuqori menyuda faol bo'lim doim ko'rinib tursin */
(()=>{const t=document.getElementById('tabs');if(!t)return;const f=()=>{if(innerWidth>900)return;const b=t.querySelector('button.on');if(!b)return;const br=b.getBoundingClientRect(),tr=t.getBoundingClientRect();t.scrollLeft+=(br.left-tr.left)-(t.clientWidth-br.width)/2};new MutationObserver(f).observe(t,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});setTimeout(f,300)})();
