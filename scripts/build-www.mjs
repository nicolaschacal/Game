// Arma la carpeta www/ que Capacitor empaqueta dentro de la app:
// copia el juego y sus módulos, y deja three.js como archivo local (sin CDN, para que funcione sin internet).
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const out = 'www';
rmSync(out, { recursive: true, force: true }); mkdirSync(out + '/vendor', { recursive: true });
cpSync('paper-voyager', out + '/paper-voyager', { recursive: true, filter: s => !/\.(py|mjs~)$/.test(s) });
cpSync('node_modules/three/build/three.module.js', out + '/vendor/three.module.js');
let html = readFileSync('paper-voyager.html', 'utf8');
html = html.replace('https://unpkg.com/three@0.164.1/build/three.module.js', './vendor/three.module.js');
// Dentro de la app, Capacitor expone window.Capacitor; lo cargamos antes del juego.
html = html.replace('<script type="importmap">', '<script src="./capacitor.js"></script>\n<script type="importmap">');
writeFileSync(out + '/index.html', html);
writeFileSync(out + '/capacitor.js', `// Puente mínimo: Capacitor inyecta window.Capacitor en la WebView nativa. En la web este archivo no hace nada.
(function(){ if (!window.Capacitor) return;
  // Plugins que el juego busca por nombre en window.Capacitor.Plugins (AdMob, Purchases, RevenueCatUI, Haptics, StatusBar, SplashScreen)
  var P = window.Capacitor.Plugins || {};
  try { P.StatusBar && P.StatusBar.hide(); } catch (e) {}
  try { P.SplashScreen && setTimeout(function(){ P.SplashScreen.hide(); }, 600); } catch (e) {}
  // Vibración: en iOS navigator.vibrate no existe; usamos Haptics
  if (!navigator.vibrate && P.Haptics) navigator.vibrate = function(p){ try { var n = Array.isArray(p) ? p.length : 1; for (var i = 0; i < Math.min(n, 3); i++) setTimeout(function(){ P.Haptics.impact({ style: 'LIGHT' }); }, i * 60); } catch (e) {} return true; };
})();`);
if (existsSync('paper-voyager/music.mp3')) console.log('música incluida');
else console.log('aviso: paper-voyager/music.mp3 no existe; la app va sin música (sólo efectos)');
console.log('www/ listo');
