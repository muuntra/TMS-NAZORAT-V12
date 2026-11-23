// Netlify shu faylni `npm run build` orqali ishga tushiradi: tayyor sayt dist/ papkasiga yig'iladi.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
const out = 'dist';
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out);
for (const p of ['index.html', 'css', 'js']) cpSync(p, `${out}/${p}`, { recursive: true });
console.log('dist/ tayyor');
