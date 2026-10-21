// Снимки всех вариантов оформления на ключевых экранах + проверка: ошибки JS, горизонтальный скролл, обрезанный текст
const puppeteer=(await import('/Users/maria/Desktop/Catalyst-KP-Bot/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default;
import {mkdirSync} from 'fs';
const BASE=process.argv[2]||'http://localhost:8811/index.html';
const screens=(process.argv[3]||'home,bat,intro,bd,mr,fw,sim,ss,cd,done,res').split(',');
const skins=(process.argv[4]||'1,2,3,4,5,6').split(',');
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const issues=[];
for(const W of [1440,390]){for(const sk of skins){const dir=`tmp/skins/${W}`;mkdirSync(dir,{recursive:true});
  const p=await b.newPage();await p.setViewport({width:W,height:W<600?860:900});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  for(const g of screens){await p.goto(`${BASE}?v=1&skin=${sk}&go=${g}`,{waitUntil:'networkidle0'});await sleep(g==='ds'?1200:500);
    await p.evaluate(()=>{const v=document.getElementById('vt');if(v)v.style.display='none'});
    await p.screenshot({path:`${dir}/s${sk}-${g}.png`});
    const r=await p.evaluate(()=>{const o={hscroll:document.documentElement.scrollWidth>innerWidth+1,clip:[]};
      document.querySelectorAll('h1,h2,.btn,.opt,.chip,.tile b,.fact b,.kicker,.top span').forEach(el=>{if(el.offsetParent&&el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).overflow!=='visible')o.clip.push(el.className+':'+el.textContent.slice(0,30))});
      document.querySelectorAll('h1,h2,.fact b,.btn').forEach(el=>{const r=el.getBoundingClientRect();if(r.right>innerWidth+1)o.clip.push('вылез:'+el.textContent.slice(0,30))});
      const fs=[...document.querySelectorAll('#app *')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.offsetParent).map(e=>parseFloat(getComputedStyle(e).fontSize));o.minFont=Math.min(...fs);return o});
    if(r.hscroll||r.clip.length||r.minFont<14)issues.push(`${W} s${sk} ${g}: ${JSON.stringify(r)}`);
  }
  if(errs.length)issues.push(`${W} s${sk} JS: ${errs.join('; ')}`);await p.close()}}
// панель: появляется только с ?v
const p=await b.newPage();await p.goto(BASE,{waitUntil:'networkidle0'});issues.push('панель без ?v: '+(await p.$('#vt')?'ЕСТЬ (ошибка)':'нет, верно'));
await p.goto(BASE+'?v=1',{waitUntil:'networkidle0'});issues.push('панель с ?v: '+(await p.$('#vt')?'есть, верно':'НЕТ (ошибка)')+', перетаскивание: '+(await p.$eval('#vt',e=>e.hasAttribute('data-drag-panel'))));
console.log(issues.join('\n')||'чисто');await b.close();
