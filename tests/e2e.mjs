// Прогон всех 10 субтестов в headless Chrome: ошибки консоли, корректность ответов, снимки экранов
const puppeteer=(await import('/Users/maria/Desktop/Catalyst-KP-Bot/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default;
const URL=process.argv[2]||'file:///Users/maria/Desktop/Catalyst-Wechsler/index.html';
const W=+(process.argv[3]||1280), SKIN=process.argv[4]||'', OUT='/Users/maria/Desktop/Catalyst-Wechsler/tmp/'+W+(SKIN?'-s'+SKIN:'');
import {mkdirSync} from 'fs'; mkdirSync(OUT,{recursive:true});
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
const p=await b.newPage(); await p.setViewport({width:W,height:W<600?860:900,deviceScaleFactor:1});
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); if(SKIN) await p.evaluate(s=>document.documentElement.dataset.skin=s,SKIN);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shot=n=>p.screenshot({path:`${OUT}/${n}.png`});
await shot('00-home');
await p.type('#nm','Тест'); await p.click('#f button'); await sleep(450); await shot('01-battery');
const startSub=async()=>{if(await p.$('#hm')){await p.click('#go'); await sleep(450);} await p.click('#go'); await sleep(450)};
const nextScr=async()=>{await p.click('#nx'); await sleep(450)};
// 1 кубики: собираем узор кликами
await startSub(); await shot('02-bd');
for(let k=0;k<10;k++){
  const it=await p.evaluate(k=>BD[k],k);
  const btns=await p.$$('#g button');
  if(!btns.length)break;
  for(let c=0;c<it.p.length;c++) for(let t=0;t<it.p[c];t++){ await p.click(`#g button[data-k="${c}"]`); }
  await sleep(900);
}
await shot('03-bd-done'); await nextScr();
// MC-раннер: отвечаем правильно все, кроме заданного числа ошибок в конце
const mc=async(arr,name,shotAt=0)=>{await startSub(); let n=0;
  while(await p.$('.opt')){ if(n===shotAt)await shot(name); const ans=await p.evaluate((a,i)=>window[a]?null:eval(a)[i].ans,arr,n); await p.click(`.opt[data-k="${ans}"]`); n++; await sleep(450);}
  await shot(name+'-done'); await nextScr(); return n;};
console.log('sim',await mc('SIM','04-sim'));
// цифры: правильные ответы читаем из показа
await startSub();
let trials=0;
for(;;){
  if(await p.$('#go')&&!(await p.$('#dg'))&&!(await p.$('#a'))){ if(await p.$('#nx'))break; await p.click('#go'); await sleep(100); continue;}
  if(await p.$('#nx'))break;
  if(await p.$('#dg')){ const seen=[]; while(await p.$('#dg')){const t=await p.$eval('#dg',e=>e.textContent).catch(()=>''); if(t&&seen[seen.length-1]!==t)seen.push(t); await sleep(60);} 
    await p.waitForSelector('#a'); const q=await p.$eval('.q',e=>e.textContent);
    let a=seen.slice(); if(q.includes('обратном'))a.reverse(); if(q.includes('возрастанию'))a.sort();
    if(trials===0)await shot('05-ds-ask');
    // в прямом порядке ошибаемся на длине 7, чтобы проверить остановку
    const wrong=q.includes('том же')&&a.length>=7;
    await p.type('#a',wrong?'0':a.join(' ')); await p.click('#f button'); trials++; await sleep(150); }
  else await sleep(100);
}
console.log('ds trials',trials); await shot('05-ds-done'); await nextScr();
console.log('mr',await mc('MR','06-mr',13));
console.log('voc',await mc('VOC','07-voc'));
// арифметика
await startSub(); let ar=0;
while(await p.$('#a')){ if(ar===10)await shot('08-ar'); const v=await p.evaluate(i=>ARI[i][1],ar); await p.type('#a',String(v).replace('.',',')); await p.click('#f button'); ar++; await sleep(200);}
console.log('ar',ar); await shot('08-ar-done'); await nextScr();
// поиск символов: 30 ответов правильно, затем ждём таймер
await startSub(); await shot('09-ss');
for(let k=0;k<30;k++){const yes=await p.evaluate(()=>{const g=[...document.querySelectorAll('#row .grp')].map(x=>x.innerHTML);return null});
  // правильный ответ вычисляем из путей SVG
  const ans=await p.evaluate(()=>{const [t,g]=[...document.querySelectorAll('#row .grp')];const tp=[...t.querySelectorAll('path')].map(x=>x.getAttribute('d'));return [...g.querySelectorAll('path')].some(x=>tp.includes(x.getAttribute('d')))});
  await p.click(ans?'#y':'#n'); await sleep(30);}
await p.waitForSelector('#nx',{timeout:130000}); await shot('09-ss-done');
const ssRes=await p.$eval('#resline',e=>e.textContent); console.log('ss',ssRes); await nextScr();
console.log('fw',await mc('FW','10-fw',9));
console.log('inf',await mc('INF','11-inf'));
// шифровка: 40 правильных
await startSub(); await shot('12-cd');
for(let k=0;k<40;k++){const d=await p.$eval('.strip .cur',e=>+e.textContent); const sym=await p.evaluate(d=>document.querySelectorAll('.key div')[d-1].querySelector('path').getAttribute('d'),d);
  const btn=await p.evaluateHandle(s=>[...document.querySelectorAll('.pad button')].find(b=>b.querySelector('path').getAttribute('d')===s),sym); await btn.click(); await sleep(20);}
await p.waitForSelector('#nx',{timeout:130000}); console.log('cd',await p.$eval('#resline',e=>e.textContent)); await nextScr();
await sleep(400); await p.screenshot({path:`${OUT}/13-results.png`,fullPage:true});
await p.click('#cm'); await sleep(200); await shot('14-compare');
console.log('res',JSON.stringify(await p.evaluate(()=>S.people['Тест'].res)));
console.log('ERRORS',errs.length?errs:'none');
await b.close();
