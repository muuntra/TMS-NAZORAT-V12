"""Papkadagi loyihani BITTA html faylga yig'adi (pochta orqali yuborish yoki bitta fayl sifatida joylash uchun).
Ishlatish:  python tools/build_single.py [chiqish_fayli.html]"""
import re,os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(root,'tmc_nazorat_single.html')
rd=lambda p:open(os.path.join(root,p.split('?')[0]),encoding='utf-8').read()
html=rd('index.html')
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>\n'+rd(m.group(1))+'</style>',html)
def js(m):
    p=m.group(1).split('?')[0]
    if p.endswith('lazy-exceljs.js'): return ''                      # bitta faylda ExcelJS darhol joylanadi
    extra='<script>\n'+rd('js/vendor/exceljs.min.js')+'</script>' if p.endswith('xlsx.full.min.js') else ''
    return '<script>\n'+rd(p)+'</script>'+extra
html=re.sub(r'<script src="([^"]+)"></script>',js,html)
open(out,'w',encoding='utf-8').write(html);print('yozildi:',out,'%.2f MB'%(len(html.encode())/1e6))
