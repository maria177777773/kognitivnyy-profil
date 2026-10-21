const puppeteer=(await import('/Users/maria/Desktop/Catalyst-KP-Bot/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default;
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(const W of [390,1280]){const p=await b.newPage();await p.setViewport({width:W,height:860});
 await p.goto('file:///Users/maria/Desktop/Catalyst-Wechsler/index.html');await p.evaluate(()=>{S={people:{X:{res:{}}},current:'X'};save()});await p.reload();
 for(const id of ['cd','bd']){await p.evaluate(id=>intro(SUB.find(s=>s.id===id)),id);await sleep(100);await p.click('#go');await sleep(300);await p.screenshot({path:`tmp/${id}-${W}.png`});
 console.log(W,id,'горизонтальный скролл:',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));}
 await p.close()}
await b.close();
