const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals=[...document.querySelectorAll('.reveal')];
const scenes=[...document.querySelectorAll('.scene')];
const fill=document.querySelector('.rail-fill');
const current=document.querySelector('.rail b');
if(reduced){reveals.forEach(el=>el.classList.add('visible'))}else{
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.16});
  reveals.forEach(el=>observer.observe(el));
}
const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?scrollY/max:0;if(fill)fill.style.height=`${progress*120}px`;let nearest=scenes[0];let distance=Infinity;scenes.forEach(scene=>{const d=Math.abs(scene.getBoundingClientRect().top-innerHeight*.35);if(d<distance){distance=d;nearest=scene}});if(current&&nearest)current.textContent=nearest.dataset.step};
addEventListener('scroll',update,{passive:true});update();
