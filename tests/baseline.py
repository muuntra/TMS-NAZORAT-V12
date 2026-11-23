"""Hisob natijalarining "oltin nusxasi" (golden baseline).
Yozib olish:   python tests/baseline.py save  index.html  <excel papka>
Solishtirish:  python tests/baseline.py check index.html  <excel papka>
Kod o'zgargandan keyin `check` hamma tovarning zakup raqamlari avvalgidek ekanini tekshiradi."""
import sys, os, glob, json, time
from playwright.sync_api import sync_playwright
mode = sys.argv[1]; html = os.path.abspath(sys.argv[2]); folder = sys.argv[3]
files = sorted(glob.glob(os.path.join(folder, '*.xlsx')))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'baseline.json')
JS = """()=>{const o={};Object.entries(ITM).forEach(([k,it])=>{o[k]={zn:Math.round((it.zn||0)*100)/100,ordq:Math.round((it.ordq||0)*100)/100,cs:!!it.cs,
 z:Object.fromEntries(Object.entries(it.z||{}).map(([w,v])=>[w,Math.round(v*100)/100]))}});return o}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context().new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:120]))
    pg.goto('file://' + html); time.sleep(.5)
    pg.set_input_files('#upf', files)
    pg.wait_for_function("document.getElementById('st').textContent.includes('Hisoblandi')", timeout=30000); time.sleep(.5)
    data = pg.evaluate(JS); b.close()
if errs: print('SAHIFA XATOLARI:', errs); sys.exit(1)
if mode == 'save':
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print('baseline yozildi:', len(data), 'tovar,', 'jami zakup =', round(sum(v['zn'] for v in data.values())))
else:
    old = json.load(open(OUT, encoding='utf-8')); bad = [k for k in set(old) | set(data) if old.get(k) != data.get(k)]
    print('✓ hamma raqam avvalgidek' if not bad else f'✗ {len(bad)} ta tovar o\'zgargan: {bad[:10]}')
    sys.exit(1 if bad else 0)
