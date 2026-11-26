// Arma site/ para Vercel: landing en la raíz y el juego en /game/.
// (La app nativa sigue usando www/, con el juego en la raíz: Capacitor no cambia.)
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
const out = 'site';
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
cpSync('landing', out, { recursive: true });
cpSync('www', out + '/game', { recursive: true });
cpSync('assets/fonts', out + '/fonts', { recursive: true });
for (const f of ['privacidad.html', 'terminos.html', 'soporte.html', 'favicon.ico']) if (existsSync(f)) cpSync(f, out + '/' + f);
cpSync('paper-voyager/apple-touch-icon.png', out + '/apple-touch-icon.png');
console.log('site/ listo (landing + /game)');
