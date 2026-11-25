
/* Navigation and accessible interactions */
const menu=document.querySelector('.menu'),links=document.querySelector('.navlinks');
function setMenu(open){
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  links.classList.toggle('open',open);
}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const track=document.querySelector('.service-track'),prev=document.querySelector('.prev'),next=document.querySelector('.next');
function update(){
  const max=Math.max(0,track.scrollWidth-track.clientWidth);
  prev.disabled=track.scrollLeft<=3;
  next.disabled=track.scrollLeft>=max-3;
  const progress=max===0?1:Math.max(0,Math.min(1,track.scrollLeft/max));
  track.closest('.services').style.setProperty('--track-progress',String(.18+.82*progress));
}
function slide(dir){
  const card=track.querySelector('.service');
  const gap=parseFloat(getComputedStyle(track).columnGap)||0;
  track.scrollBy({left:dir*(card.offsetWidth+gap),behavior:motion.matches?'auto':'smooth'});
}
prev.addEventListener('click',()=>slide(-1));
next.addEventListener('click',()=>slide(1));
track.addEventListener('scroll',update,{passive:true});
window.addEventListener('resize',update);
update();

/* One-time reveals: content stays visible when JS or motion is disabled. */
if('IntersectionObserver' in window && !motion.matches){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('motion-enter');
      observer.unobserve(entry.target);
    });
  },{threshold:.08});
  const groups=['.intro > div','.services .section-head > div','.service-track > article','.consumer .section-head > *','.consumer-grid > article','.history > div','.team .section-head > *','.team-profile > div','.faq > div:first-child','.faq-list > details','.contact > div'];
  groups.forEach(selector=>{
    document.querySelectorAll(selector).forEach((el,i)=>{
      el.style.setProperty('--reveal-delay',Math.min(i%3,2)*75+'ms');
      observer.observe(el);
    });
  });
}

/* Highlight the section nearest the top as the reader scrolls. */
const navItems=[...links.querySelectorAll('a[href^="#"]')].map(link=>({link,section:document.getElementById(link.hash.slice(1))})).filter(item=>item.section);
let scheduled=false;
function updateNav(){
  scheduled=false;
  const line=window.innerHeight*.35;
  let active=null;
  for(const item of navItems){
    const rect=item.section.getBoundingClientRect();
    if(rect.top<=line && rect.bottom>line)active=item.link;
  }
  navItems.forEach(({link})=>{if(link===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}}, {passive:true});
window.addEventListener('resize',updateNav);
updateNav();

const portrait=document.querySelector('.team-portrait img');
if(portrait){
  const fallback=()=>portrait.classList.add('failed');
  portrait.addEventListener('error',fallback);
  if(portrait.complete&&!portrait.naturalWidth)fallback();
}
