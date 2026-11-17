import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { build } from 'esbuild';
import sharp from 'sharp';

await rm('www',{recursive:true,force:true});
await mkdir('www/assets',{recursive:true});
const html = await readFile('index.html','utf8');
const art = html.match(/(<img[^>]*class="menu-illustration"[^>]*src=")data:image\/png;base64,([^"]+)/);
let output = html;
if (art) {
  const png = Buffer.from(art[2], 'base64');
  await writeFile('www/assets/menu.png',png);
  output = output.replace(art[0], art[1] + './assets/menu.png');
  output = output.replace('<img class="menu-backdrop"', '<img class="menu-backdrop" src="./assets/menu.png"');
  // Ícone recortado da arte ilustrada real, não redesenhado com formas simples.
  const meta = await sharp(png).metadata();
  const w = meta.width || 620, h = meta.height || 1270;
  const square = Math.min(w, Math.round(h*.50));
  const left = Math.round((w-square)/2);
  const top = Math.min(h-square,Math.round(h*.12));
  await sharp(png).extract({left,top,width:square,height:square})
    .resize(512,512,{fit:'cover'}).png().toFile('www/assets/icon-512.png');
  await sharp(png).extract({left,top,width:square,height:square})
    .resize(192,192,{fit:'cover'}).png().toFile('www/assets/icon-192.png');
} else {
  throw new Error('A ilustração original do menu não foi encontrada no HTML.');
}
output=output.replace('</head>', '<link rel="stylesheet" href="./menu-responsive.css"></head>');
output=output.replace('</body>','<script defer src="./native-updates.js"></script><script>if(!window.Capacitor?.isNativePlatform?.() && "serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}</script></body>');
await writeFile('www/index.html',output);
await cp('menu-responsive.css','www/menu-responsive.css');
await writeFile('www/versao.json',await readFile('versao.json','utf8'));
await writeFile('www/manifest.webmanifest',JSON.stringify({
 name:'Sudoklue',short_name:'Sudoklue',lang:'pt-BR',display:'standalone',
 start_url:'./',scope:'./',background_color:'#5930a0',theme_color:'#5930a0',
 icons:[{src:'./assets/icon-192.png',sizes:'192x192',type:'image/png'},{src:'./assets/icon-512.png',sizes:'512x512',type:'image/png'}]
},null,2));
const cacheName='sudoklue-'+JSON.parse(await readFile('versao.json','utf8')).version;
await writeFile('www/sw.js',[
  'const CACHE='+JSON.stringify(cacheName)+';',
  "self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./assets/menu.png','./assets/icon-192.png','./assets/icon-512.png','./menu-responsive.css','./native-updates.js','./manifest.webmanifest']))));",
  "self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sudoklue-')&&k!==CACHE).map(k=>caches.delete(k))))));",
  "self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).pathname.includes('/updates/'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});"
].join('\n'));
await build({ entryPoints:['src/native-updates.js'],outfile:'www/native-updates.js',bundle:true,minify:true,format:'iife',platform:'browser',target:'es2020' });
await rm('dist-pages',{recursive:true,force:true});
await cp('www','dist-pages',{recursive:true});
console.log('Sudoklue: site e app Android preparados, mantendo os desenhos originais.');
