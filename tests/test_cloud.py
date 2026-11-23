"""Bulut qatlami testi (Supabase soxta javoblar bilan): login, baza saqlash, Excel saqlash, tiklash.
Ishlatish: python tests/test_cloud.py dist/index.html <excel papka>"""
import sys, os, glob, json, time
from playwright.sync_api import sync_playwright
html = os.path.abspath(sys.argv[1]); files = sorted(glob.glob(os.path.join(sys.argv[2], '*.xlsx')))
OK, BAD = [], []
def check(n, c, i=''): (OK if c else BAD).append(n); print(('✓ ' if c else '✗ ') + n + (f'  [{i}]' if i else ''))
SESSION = {"access_token": "a.b.c", "token_type": "bearer", "expires_in": 3600, "expires_at": int(time.time()) + 3600, "refresh_token": "r",
           "user": {"id": "u1", "aud": "authenticated", "role": "authenticated", "email": "zakup@xumo.uz", "app_metadata": {}, "user_metadata": {}, "created_at": "2026-01-01T00:00:00Z"}}
cloud_rows = []; reqs = []; STORE = {}   # STORE: {'s.xlsx': bytes} — bulutdagi fayllar
def handler(route):
    r = route.request; u = r.url; reqs.append((r.method, u))
    J = lambda b, s=200: route.fulfill(status=s, content_type='application/json', body=json.dumps(b), headers={'access-control-allow-origin': '*'})
    if r.method == 'OPTIONS': return route.fulfill(status=204, headers={'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
    if '/auth/v1/token' in u:
        body = json.loads(r.post_data or '{}')
        return J(SESSION) if body.get('password') == 'togri' else J({"error": "invalid_grant", "error_description": "Invalid login credentials", "msg": "Invalid login credentials"}, 400)
    if '/rest/v1/app_state' in u:
        if r.method == 'GET': return J(cloud_rows)
        return J([], 201)
    if '/storage/v1/object/list/' in u: return J([{'name': n} for n in STORE])
    if '/storage/v1/object/' in u:
        if r.method == 'GET':
            n = u.split('/u1/')[1].split('?')[0]
            return route.fulfill(status=200, body=STORE[n], content_type='application/octet-stream', headers={'access-control-allow-origin': '*'}) if n in STORE else J({'error': 'not found'}, 404)
        return J({"Key": "uploads/x"})
    return J({})
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context().new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:150]))
    pg.route('**/hjxgjtucycquvmvljmvo.supabase.co/**', handler)
    pg.goto('file://' + html); pg.wait_for_timeout(800)
    check('«☁ Kirish» tugmasi bor', pg.locator('#cl_btn').inner_text().strip() == '☁ Kirish')
    pg.click('#cl_btn'); check('login oynasi ochildi', pg.locator('#cl_dlg').count() == 1)
    pg.fill('#cl_em', 'zakup@xumo.uz'); pg.fill('#cl_pw', 'xato'); pg.click('#cl_ok'); pg.wait_for_timeout(800)
    check("noto'g'ri parol: tushunarli xabar", "noto'g'ri" in pg.inner_text('#cl_er'), pg.inner_text('#cl_er'))
    pg.fill('#cl_pw', 'togri'); pg.click('#cl_ok'); pg.wait_for_timeout(1200)
    check('login bo\'ldi, tugmada ism ko\'rinadi', pg.locator('#cl_btn').inner_text().strip() == '☁ zakup', pg.locator('#cl_btn').inner_text())
    check('oyna yopildi', pg.locator('#cl_dlg').count() == 0)
    reqs.clear(); pg.evaluate("localStorage.setItem('tmc_plan','{\"a\":1}')"); pg.wait_for_timeout(2500)
    check('baza o\'zgarishi bulutga yuborildi (app_state POST)', any(m == 'POST' and 'app_state' in u for m, u in reqs))
    reqs.clear(); pg.evaluate("localStorage.setItem('tmc_theme','dark')"); pg.wait_for_timeout(2000)
    check('tema kabi lokal sozlama bulutga ketmaydi', not any('app_state' in u for m, u in reqs))
    reqs.clear(); pg.set_input_files('#upf', files)
    pg.wait_for_function("document.getElementById('st').textContent.includes('Hisoblandi')", timeout=30000); pg.wait_for_timeout(2000)
    ups = [u for m, u in reqs if '/storage/v1/object/uploads/u1/' in u and m in ('POST', 'PUT')]
    names = sorted(u.split('/u1/')[1].split('?')[0] for u in ups)
    check('Excel fayllar bulutga yuklandi (har tur bittadan)', names == ['d.xlsx', 'h.xlsx', 'm.xlsx', 's.xlsx'], str(names))
    # bulutda yangiroq baza bor: kirishda lokalga tushib, sahifa qayta yuklanishi kerak
    cloud_rows.append({"key": "tmc_plan", "value": "{\"a\":2}", "updated_at": "2099-01-01T00:00:00Z"})
    pg.reload(); pg.wait_for_timeout(2500)
    v = pg.evaluate("localStorage.getItem('tmc_plan')"); check('bulutdagi yangi baza lokalga tushdi', v == '{"a":2}', v)
    check('sahifa xatosiz ishladi', not errs, str(errs[:2]))
    # --- toza brauzer (boshqa kompyuter): login qilsa fayllar o'zi tiklanishi kerak ---
    kind_file = {'s': 'Продажа', 'd': 'Остатки', 'h': 'История', 'm': 'Динамика'}
    for k, key in kind_file.items():
        f = [x for x in files if key in os.path.basename(x)][0]; STORE[k + '.xlsx'] = open(f, 'rb').read()
    cloud_rows.clear(); errs2 = []
    pg2 = b.new_context().new_page(); pg2.on('pageerror', lambda e: errs2.append(str(e)[:150]))
    pg2.route('**/hjxgjtucycquvmvljmvo.supabase.co/**', handler)
    pg2.goto('file://' + html); pg2.wait_for_timeout(800)
    pg2.click('#cl_btn'); pg2.fill('#cl_em', 'zakup@xumo.uz'); pg2.fill('#cl_pw', 'togri'); pg2.click('#cl_ok')
    try:
        pg2.wait_for_function("document.getElementById('st').textContent.includes('Hisoblandi')", timeout=30000); done = True
    except Exception: done = False
    check("yangi kompyuterda login → Excel fayllar o'zi yuklanib hisoblandi", done)
    n2 = pg2.evaluate("typeof ITM!=='undefined'?Object.keys(ITM).length:0"); check('tovarlar soni asl bilan teng (572)', n2 == 572, str(n2))
    check('tiklashda sahifa xatosiz', not errs2, str(errs2[:2])); b.close()
print(f'\n{len(OK)} o\'tdi, {len(BAD)} yiqildi'); sys.exit(1 if BAD else 0)
