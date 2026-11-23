"""TMC nazorat — avtomatik test.  Ishlatish:
    pip install playwright && playwright install chromium
    python test_tmc.py tmc_nazorat_kompakt.html  <excel fayllar papkasi>
Papkada excellar bo'lishi kerak (Продажа, Остатки, Ойлик история, Динамика; ixtiyoriy: Поставщик ro'yxati)."""
import sys, time, glob, os
from playwright.sync_api import sync_playwright
html = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'tmc_nazorat_kompakt.html')
folder = sys.argv[2] if len(sys.argv) > 2 else '.'
files = sorted(glob.glob(os.path.join(folder, '*.xlsx')))
OK, BAD = [], []
def check(name, cond, info=''):
    (OK if cond else BAD).append(name); print(('✓ ' if cond else '✗ ') + name + (f'  [{info}]' if info else ''))
def load(pg, ls=None):
    pg.goto('file://' + html); time.sleep(.5)
    if ls:
        for k, v in ls.items(): pg.evaluate('([k,v])=>localStorage.setItem(k,v)', [k, v])
        pg.reload(); time.sleep(.5)
    pg.set_input_files('#upf', files)
    pg.wait_for_function("document.getElementById('st').textContent.includes('Hisoblandi')", timeout=30000); time.sleep(.5)
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1440, 'height': 800}, accept_downloads=True); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:120]))
    check('4 ta fayl topildi', len(files) >= 4, f'{len(files)} fayl')
    load(pg)
    check('hamma fayl turi aniqlandi', pg.inner_text('#upm').count('✓') == len(files), pg.inner_text('#upm')[:90])
    n = pg.evaluate('Object.keys(ITM).length'); check('tovarlar hisoblandi', n > 100, f'{n} ta')
    pg.get_by_role('button', name='Заявка', exact=True).click(); time.sleep(1)
    rows = pg.locator('#out tbody tr').count(); check('Заявка jadvali chiqdi', rows > 100, f'{rows} qator')
    bad = pg.evaluate("""()=>{let b=0,c=0;Object.values(ITM).forEach(it=>{if(!it.dt)return;Object.entries(it.dt).forEach(([w,d])=>{c++;if(d.d0!==Math.max(0,d.nd-d.s-d.trc))b++;if(it.z[w]<0||it.z[w]>d.d0)b++});
      const s=Object.values(it.z).reduce((a,x)=>a+x,0);if(Math.abs(s-it.zn)>0.5)b++});return b}""")
    check('hisob formulasi: defitsit = ehtiyoj − qoldiq − yo\'lda; 0 ≤ zakup ≤ defitsit; Σ filial = Итого', bad == 0, f'{bad} ta xato')
    mism = pg.evaluate("""()=>{const t=document.querySelector('#out table');const c=t.__h.findIndex((h,i)=>h==='Итого'&&t.__g[i]==='Количество заявки');let m=0;
      [...t.tBodies[0].rows].forEach(r=>{const it=ITM[r.cells[0].textContent.trim()];if(it&&Math.round(it.zn)!==parseInt(r.cells[c].textContent.replace(/\\s/g,''))||0)m++});return m}""")
    check('jadvaldagi «Итого» hisob bilan mos', mism == 0, f'{mism} ta nomos')
    cell = pg.evaluate("""()=>{const t=document.querySelector('#out table');const c=t.__h.findIndex((h,i)=>h==='Ташкент'&&t.__g[i]==='Количество заявки');const r=[...t.tBodies[0].rows].findIndex(r=>parseInt(r.cells[c].textContent)>0);return [r,c,t.tBodies[0].rows[r].cells[c].textContent.trim()]}""")
    pg.locator('#out tbody tr').nth(cell[0]).locator('td').nth(cell[1]).hover(); time.sleep(.3)
    tip = pg.inner_text('#zhov'); check('hover isboti jadvaldagi raqamga teng', tip.replace('\n', ' ').split('ZAKUPGA')[-1].split()[0] == cell[2], cell[2])
    pg.get_by_role('button', name='📦 Buyurtma').click(); time.sleep(.4)
    check('yetkazuvchi buyurtmalari chiqdi', pg.locator('#sopan details').count() > 0, f"{pg.locator('#sopan details').count()} guruh")
    sg, so = pg.evaluate("[window.__SG.reduce((a,g)=>a+g.q,0), Object.values(ITM).reduce((a,i)=>a+(i.ordq>0?i.ordq:((i.zn>0&&!i.cs)?i.zn:0)),0)]")
    check('buyurtma panelidagi jami = jadvaldagi zakaz (kesh hajmi yo\'q tovarlar ham qo\'shilgan)', sg == so, f'{sg} = {so}')
    nr = pg.evaluate("window.__SG.reduce((a,g)=>a+g.rows.filter(x=>!(x.q>0)&&!String(x.r[x.r.length-2]||'').trim()).length,0)")
    check('zakup yo\'q har bir qatorda sabab yozilgan', nr == 0, f'{nr} ta sababsiz qator')
    ns = pg.evaluate("window.__SG.reduce((a,g)=>a+g.rows.filter(x=>typeof x.id!=='number'&&x.id!=='').length,0)")
    check('ID ustuni bir xil turda (hammasi son)', ns == 0, f'{ns} ta matn ID')
    ids = pg.evaluate("(()=>{const a=window.__SG.flatMap(g=>g.rows.filter(x=>x.q>0).map(x=>x.id));return [a.length,new Set(a).size]})()")
    check('har tovar buyurtmada faqat bir marta', ids[0] == ids[1])
    nsup = pg.evaluate('SUP.length')
    if nsup:
        un = pg.evaluate("(()=>{const g=window.__SG.find(g=>g.n.startsWith('⚠'));return g?g.rows.filter(x=>x.q>0).length:0})()")
        check('zakazli tovarlarning hammasi yetkazuvchiga bog\'langan (nomi bo\'yicha)', un == 0, f'{un} ta yetkazuvchisiz')
        names = pg.evaluate("new Set(SUP.map(s=>String(s.name).replace(/\\s+/g,' ').trim().toLowerCase())).size")
        listed = pg.evaluate("window.__SG.filter(g=>!g.n.startsWith('⚠')).reduce((a,g)=>a+g.rows.length,0)")
        check('ro\'yxatdagi hamma dori buyurtmaga kiritilgan', listed >= names, f'{listed} qator, ro\'yxatda {names} nom')
        z = pg.evaluate("window.__SG.every(g=>{const q=g.rows.map(x=>x.zn);return q.every((v,i)=>i==0||q[i-1]>=v)})")
        check('har yetkazuvchida zakazli tovar tepada, nollar pastda', z)
        with pg.expect_download(timeout=60000) as dl:
            pg.evaluate("window.__xl([window.__SG[0]],'Tmc_Zayavka_test.xlsx')")
        pth = dl.value.path(); check('Tmc_Zayavka Excel yuklandi', pth and os.path.getsize(pth) > 5000, dl.value.suggested_filename)
        mm = pg.evaluate("""()=>{const S=window.__ZSR?1:0,mi=(+document.getElementById('minc').value||25)/100,zm=(+document.getElementById('zmin').value||0)/100;let n=0,bad=0;
            window.__SG.forEach(g=>g.rows.forEach(x=>{const r=x.r,L=r.length,cs=+r[35+S]||0,zn=+r[32]||0;if(!(cs>0)||!x.has||/Zakup .* buyurtmasida/.test(String(r[L-2])))return;const cls=String(r[34+S]||''),abc=/^[ABC]/.test(cls)?cls[0]:'',xyz=/[XYZ]$/.test(cls)?cls.slice(-1):'';n++;if(window.__fxCases(zn,cs,abc,xyz,mi,zm)!==(+r[L-5]||0))bad++}));return [n,bad]}""")
        check('Excel formulasi mantiqi dastur hisobiga teng (kesh va Z-qoida)', mm[1] == 0, f'{mm[0]} qator, {mm[1]} farq')
        try:
            import openpyxl
            tp = os.path.join(__import__('tempfile').gettempdir(), 'tmc_test_zayavka.xlsx'); dl.value.save_as(tp)
            wbk = openpyxl.load_workbook(tp); wsk = wbk.worksheets[0]
            nf = sum(1 for r in wsk.iter_rows(min_row=4) for c in r if isinstance(c.value, str) and c.value.startswith('='))
            check("Excelda formulalar va Parametrlar varag'i bor", nf > 50 and 'Parametrlar' in wbk.sheetnames, f'{nf} ta formula')
        except ImportError:
            print("· openpyxl yo'q: formulalarni tekshirish o'tkazib yuborildi")
        b3 = ctx.new_page(); b3.goto('file://' + html); time.sleep(.6)
        check('yetkazuvchi bazasi sahifa yangilanganda saqlanadi', b3.evaluate('SUP.length') == nsup)
    if pg.evaluate("typeof RV!=='undefined'&&!!RV&&!!RV.R"):
        rj = pg.evaluate("(()=>{PLN.plan=6.5e9;const m=__rm(),L=m.last,sp=m.R.reduce((a,x)=>a+x.v[L],0);return {pct:m.mtd/m.P,t:m.el/m.tot,rel:Math.abs(sp-m.mtd)/m.mtd,F:m.F0}})()")
        check('Reja: bajarilgan foiz = savdo / reja', abs(rj['pct'] - pg.evaluate('RV.tm[RV.tm.length-1]') / 6.5e9) < 1e-9, f"{rj['pct']*100:.1f}%")
        check('Reja: tovarlar yig\'indisi oylik jami savdoga teng (±0,5%)', rj['rel'] < 0.005, f"farq {rj['rel']*100:.3f}%")
        check('Reja: prognoz va ish kunlari hisoblangan', rj['F'] > 0 and 0 < rj['t'] <= 1, f"kun {rj['t']*100:.0f}%")
    if pg.evaluate("!!document.querySelector('#tabs [data-t=__tv]')"):
        pg.evaluate("document.querySelector('#tabs [data-t=__tv]').click()"); time.sleep(.8)
        tv = pg.evaluate("""(()=>{const T=__tv(),R=T.rows,P=T.P;let b=0;
          R.forEach(o=>{if(o.it&&(Math.round(o.it.K)!==Math.round(o.br)||Math.round(o.it.S)!==Math.round(o.sq)))b++;
            if(o.tags.includes('out')&&!(o.br===0&&o.sq>0))b++;if(o.tags.includes('low')&&!(o.sq>0&&o.br>0&&o.cover<=40))b++;
            if(o.br>0&&o.daily>0&&Math.abs(o.cover-o.br/(o.sq/P))>1e-9)b++;if((o.br===0||o.sq===0)&&o.tags.includes('nodata')&&!o.why.length)b++});
          const ids=new Set(R.map(r=>r.id)),nm=new Set(R.map(r=>String(r.name).replace(/\\s+/g,' ').trim().toLowerCase()));
          const miss=Object.keys(ITM).filter(i=>!ids.has(i)).length+((typeof RV!=='undefined'&&RV&&RV.R)?RV.R.filter(r=>!ids.has(String(r.id))).length:0)+[...new Set(SUP.map(s=>String(s.name).replace(/\\s+/g,' ').trim().toLowerCase()))].filter(n=>!nm.has(n)).length;
          return {rows:R.length,bad:b,miss,dom:document.querySelectorAll('#tv tr[data-id]').length}})()""")
        check('Tovar tahlili: qoldiq, sotuv, necha kunga yetishi va holatlar hisobga mos', tv['bad'] == 0, f"{tv['rows']} tovar, {tv['bad']} xato")
        check("Tovar tahlili: ostatka/savdo/ro'yxatdagi hech bir tovar tushib qolmagan", tv['miss'] == 0, f"{tv['miss']} ta tushib qolgan")
        pg.evaluate("document.querySelector('#tabs [data-t=\"Заявка\"]').click()"); time.sleep(1)
        check('Tovar tahlilidan boshqa bo\'limga qaytish ishlaydi', pg.locator('#out tbody tr').count() > 50)
    try:
        import openpyxl
        st = [f for f in files if 'Остатки' in os.path.basename(f)]
        if st and pg.evaluate("typeof __nt==='function'"):
            ws = openpyxl.load_workbook(st[0], read_only=True).active; it = ws.iter_rows(values_only=True); hd = [str(c or '').strip() for c in next(it)]
            ci = {k: hd.index(k) for k in ('В наличии', 'Закупочная стоимость', 'Цена продажи')}; sc = sp = 0
            for r in it:
                q, c, p_ = (float(r[ci[k]] or 0) if str(r[ci[k]] or '0').replace('.', '', 1).isdigit() else 0 for k in ('В наличии', 'Закупочная стоимость', 'Цена продажи'))
                if q > 0 and c > 0 and p_ > 0: sc += q * c; sp += q * p_
            nt = pg.evaluate("(()=>{const m=__nt();return [m.T.mk,m.T.cv,m.T.pv]})()")
            check("Natsenka: vaznli o'rtacha va qiymatlar mustaqil hisobga teng", abs(nt[0] - (sp / sc - 1)) < 1e-9 and abs(nt[1] - sc) < 1 and abs(nt[2] - sp) < 1, f"{nt[0]*100:.3f}% (mustaqil {(sp/sc-1)*100:.3f}%)")
    except ImportError:
        pass
    check('sahifa xatosiz ishladi', not errs, ' | '.join(errs))
    b2 = b.new_context().new_page(); errs2 = []; b2.on('pageerror', lambda e: errs2.append(str(e)[:120]))
    load(b2, {'tmc_sup': '{}', 'tmc_ctl': '{"x":1}', 'tmc_ko': '[1]'}); b2.get_by_role('button', name='Заявка', exact=True).click(); time.sleep(1)
    check('buzilgan brauzer xotirasida ham Заявка ishlaydi', b2.locator('#out tbody tr').count() > 100 and not errs2)
    b.close()
print(f'\n{len(OK)} o\'tdi, {len(BAD)} yiqildi'); sys.exit(1 if BAD else 0)
