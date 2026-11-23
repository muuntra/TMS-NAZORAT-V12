/* ExcelJS (948 KB) sahifa yuklanishini sekinlatmasligi uchun alohida, fonda yuklanadi.
   Excel yaratadigan funksiyalar (buildXlsx, supExcel) kutubxona tayyor bo'lguncha kutib turadi. */
(()=>{let p=null;const load=()=>p||(p=new Promise((res,rej)=>{if(window.ExcelJS)return res();const s=document.createElement('script');s.src='js/vendor/exceljs.min.js'+(window.__V?('?v='+window.__V):'');s.onload=res;s.onerror=()=>{p=null;rej(new Error('ExcelJS yuklanmadi (js/vendor/exceljs.min.js topilmadi)'))};document.head.appendChild(s)}));
 window.__loadExcelJS=load;
 ['buildXlsx','supExcel'].forEach(n=>{const f=window[n];if(typeof f!=='function')return;window[n]=async function(...a){await load();return f.apply(this,a)}});
 const idle=window.requestIdleCallback||(f=>setTimeout(f,800));addEventListener('load',()=>idle(()=>load().catch(()=>{})))})();
