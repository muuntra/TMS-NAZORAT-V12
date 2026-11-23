# TMC nazorat (v10.5)

Ta'minot, zakup va nazorat tizimi. Hisob-kitob brauzerda bajariladi; Supabase orqali baza va Excel fayllar bulutda avtomatik saqlanadi.

## Joylash (bir marta)
1. **Supabase:** Dashboard → SQL Editor → `supabase/schema.sql` ni to'liq qo'yib **Run**.
2. **Supabase:** Authentication → Users → **Add user** (email + parol, "Auto Confirm User" yoqilgan). Authentication → Sign In / Providers → Email: **"Allow new users to sign up" ni o'chiring** (begona odam ro'yxatdan o'ta olmasin).
3. **GitHub:** shu papkani yangi repository ga yuklang (`node_modules/` va `dist/` yuklanmaydi, `.gitignore` da bor).
4. **Netlify:** Add new site → Import from Git → shu repo. Sozlamalar `netlify.toml` dan o'zi olinadi (Build: `npm run build`, Publish: `dist`). Hech narsa qo'shimcha kiritish shart emas.
5. **Domen:** Netlify → Domain management → Add custom domain, ko'rsatilgan DNS yozuvlarini domen sotuvchisida kiriting. HTTPS o'zi yoqiladi.

Shundan keyin har safar GitHub ga o'zgarish yuklasangiz, sayt o'zi yangilanadi.

## Kundalik ishlash
Saytga kiring → **☁ Kirish** → Excel fayllarni tashlang. Fayllar va baza (yetkazuvchi, reja, moliya...) o'zi bulutga saqlanadi; boshqa kompyuterdan kirsangiz o'zi tiklanadi. Login bo'lmasa ham tizim avvalgidek ishlaydi (faqat bulutga saqlanmaydi).

## Fayllarni boshqarish (v10.5)
- Har bir fayl katakchasida **✕** tugmasi: faylni olib tashlaydi va (kirgan bo'lsangiz) **serverdan ham o'chiradi**.
- **🗂 Fayllar** tugmasi: serverdagi fayllar ro'yxati (hajmi, sanasi) — **Almashtirish**, ⬇ yuklab olish, **O'chirish**.
- Yakka katakchadan yoki sudrab tashlangan fayl ham endi serverga saqlanadi (oldin faqat «Excel yuklash» orqali edi).

- **F5 (yangilash)** dan keyin fayllar o'zi tiklanadi: avval brauzer xotirasidan (login shart emas), keyin serverdagi yangiroq nusxa bilan solishtiriladi (`js/features/filecache.js`).

## Dizayn va Tailwind (v10.5)
- Yangi bo'limlar (bulut oynalari, Поставщик formasi) **Tailwind klasslari** bilan yozilgan; `js/` va `index.html` skanerlanadi, shuning uchun JS ichida yangi klass yozsangiz `npm run build:css` (yoki `npm run build`) qiling.
- Eslatma: `css/app.css` (qatlamsiz) Tailwind (`@layer`) dan kuchliroq. Tugma/`label` kabi eski qoidalar bilan to'qnashsa, klassga `!` qo'shing (masalan `rounded-xl!`, `flex-row!`).
- Mobil/planshet (≤900px) maketi `css/features.css` oxirida: yuqorida yopishqoq menyu, jadvallar o'z ichida siljiydi.

## Tuzilish
| Fayl | Nima |
|---|---|
| `index.html` | Sahifa skeleti |
| `css/app.css`, `css/features.css` | Asosiy dizayn |
| `css/tailwind.css` | **Avtomatik yaratiladi** (`npm run build:css`), qo'lda tahrirlamang. Manba: `src/tailwind.css` |
| `js/app.js` | Asosiy tizim (Заявка, Moliya, ABC/XYZ, Поставщик) |
| `js/features/*.js` | Qo'shimcha bo'limlar; `cloud.js` — Supabase (login, saqlash, tiklash) |
| `js/config.js` | Supabase URL va **publishable** kalit (maxfiy emas). `service_role` kalitni bu yerga yozmang |
| `supabase/schema.sql` | Jadval va xavfsizlik qoidalari (RLS) |
| `tests/` | `test_tmc.py` (hisob), `baseline.py` (raqamlar o'zgarmaganini tekshirish), `test_cloud.py` (bulut, soxta Supabase bilan) |
| `tools/build.mjs` | `dist/` ni yig'adi; `tools/build_single.py` — bitta offline html |

Yuklash tartibi muhim: `app.js` birinchi, `tovar-tahlili.js` `natsenka.js` dan oldin, `config.js` → `supabase.min.js` → `cloud.js`.

## O'zgarish kiritgandan keyin
```
npm install            # bir marta
npm run build          # css/tailwind.css va dist/ ni yangilaydi
pip install playwright openpyxl && playwright install chromium
python tests/test_tmc.py dist/index.html <excel papka>
python tests/baseline.py check dist/index.html <excel papka>   # raqamlar avvalgidek bo'lsa ✓
python tests/test_cloud.py dist/index.html <excel papka>
```
Brauzer eski faylni eslab qolmasligi uchun `index.html` da `?v=10.0` ni yangi raqamga almashtiring (`window.__V` ham).
Tailwind: preflight (reset) ataylab qo'shilmagan, eski dizayn buzilmasligi uchun. Yangi bo'limlarda Tailwind klasslarini ishlating.
