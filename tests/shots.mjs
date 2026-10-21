// Быстрые снимки кубиков (2x2 и 3x3) и проверка остановки после 3 ошибок в выборе ответа
const puppeteer=(await import('/Users/maria/Desktop/Catalyst-KP-Bot/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default;
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(const W of [390,1280]){
  const p=await b.newPage();await p.setViewport({width:W,height:860});
  await p.goto('file:///Users/maria/Desktop/Catalyst-Wechsler/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();
  await p.type('#nm','Б');await p.click('#f button');await sleep(150);await p.click('#go');await sleep(100);await p.click('#go');await sleep(200);
  await p.screenshot({path:`tmp/bd2-${W}.png`});
  for(let k=0;k<5;k++){const it=await p.evaluate(k=>BD[k],k);for(let c=0;c<4;c++)for(let t=0;t<it.p[c];t++)await p.click(`#g button[data-k="${c}"]`);await sleep(800)}
  await p.screenshot({path:`tmp/bd3-${W}.png`});
  await p.close();
}
// остановка: Сходства, 3 неверных подряд
const p=await b.newPage();await p.goto('file:///Users/maria/Desktop/Catalyst-Wechsler/index.html');
await p.evaluate(()=>{S={people:{X:{res:{bd:{raw:1,max:45}}}},current:'X'};save()});await p.reload();
await p.click('#go');await sleep(100);await p.click('#go');await sleep(150);let n=0;
while(await p.$('.opt')){const a=await p.evaluate(i=>SIM[i].ans,n);await p.click(`.opt[data-k="${(a+1)%4}"]`);n++;await sleep(180)}
console.log('стоп после',n,'заданий:',await p.$eval('.card p',e=>e.textContent));
await b.close();
