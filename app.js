const $ = (s) => document.querySelector(s);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let motionOverride = false;
try{motionOverride=localStorage.getItem('nischaya-studio-motion')==='enabled';}catch{}
if(motionOverride)paused=false;
const reduceMotion = () => reduced.matches && !motionOverride;
let projects = [], activeFilter = 'all', expanded = false, cvPage = 1;
const categoryNames = { skill: 'ING Skill', '3d': '3D & experiences', rive: 'Interactive / Rive' };
const interactiveNames = ['Puppy eye follow bee', 'Maze — do not touch the wall', 'Button hover & press'];
const closeDialog = (dialog) => { dialog.close(); if(dialog.id === 'project-dialog') $('#project-player').replaceChildren(); };
document.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', e => { if(e.target === dialog) {const r = dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeDialog(dialog);} });
  dialog.addEventListener('close',()=>{if(dialog.id==='project-dialog') $('#project-player').replaceChildren();document.body.style.overflow='';});
});

function renderProjects() {
  const filtered = projects.filter(p => activeFilter === 'all' || p.category === activeFilter);
  const visible = expanded ? filtered : filtered.slice(0,5);
  $('#project-grid').replaceChildren(...visible.map(p => {
    const button = document.createElement('button'); button.className='project-card';button.dataset.project=p.id;
    button.setAttribute('aria-label', (p.video ? 'Watch ' : 'Explore ') + p.title);
    const imageBox=document.createElement('div');imageBox.className='project-image';
    const image=document.createElement('img');image.src=p.poster;image.alt=p.title+' project preview';image.loading='lazy';image.width=1200;image.height=750;
    const play=document.createElement('span');play.className='project-play';play.textContent=p.video?'▶':'↗';play.setAttribute('aria-hidden','true');
    imageBox.append(image,play);
    const meta=document.createElement('div');meta.className='project-meta';
    const text=document.createElement('div'), title=document.createElement('h3'),category=document.createElement('p');title.textContent=p.title;category.textContent=categoryNames[p.category];text.append(title,category);
    const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');meta.append(text,arrow);button.append(imageBox,meta);
    button.addEventListener('click',()=>openProject(p.id));return button;
  }));
  $('#project-count').textContent=filtered.length+' projects';
  $('#show-more').hidden=filtered.length<=5;
  $('#show-more').style.display=filtered.length<=5?'none':'flex';
  $('#show-more').innerHTML=expanded?'Show selected projects <span>↑</span>':'Explore all '+filtered.length+' projects <span>↓</span>';
  document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===activeFilter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
function setFilter(filter){if(!['all','skill','3d','rive'].includes(filter))throw new Error('Unknown project category');activeFilter=filter;expanded=false;renderProjects();}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.filter)));
$('#show-more').addEventListener('click',()=>{expanded=!expanded;renderProjects();});

function openProject(id) {
  const p=projects.find(p=>p.id===id);if(!p)throw new Error('Project not found');
  $('#dialog-title').textContent=p.title;$('#dialog-category').textContent=categoryNames[p.category];$('#project-source').href=p.url;
  $('#dialog-description').textContent=p.video?'Video from my existing portfolio. If the player requires access, open the original on Google Drive.':'An interactive project from my portfolio. Open the original experience to try it.';
  const player=$('#project-player');player.replaceChildren();
  if(p.video){const frame=document.createElement('iframe');frame.src='https://drive.google.com/file/d/'+p.driveId+'/preview';frame.title=p.title+' video player';frame.allow='autoplay; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';player.append(frame);}
  else {const img=document.createElement('img');img.src=p.poster;img.alt=p.title;const link=document.createElement('a');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';link.className='button champagne player-external';link.textContent='Explore the experience ↗';player.append(img,link);}
  document.body.style.overflow='hidden';$('#project-dialog').showModal();
}

function updateCV(){ $('#cv-page').src='assets/cv-'+cvPage+'.png';$('#cv-page').alt='Original CV of Nischaya Adhikari, page '+cvPage+' of 2';$('#cv-page-count').textContent=cvPage+' / 2';$('#cv-prev').disabled=cvPage===1;$('#cv-next').disabled=cvPage===2;}
$('#cv-prev').addEventListener('click',()=>{cvPage=Math.max(1,cvPage-1);updateCV();});
$('#cv-next').addEventListener('click',()=>{cvPage=Math.min(2,cvPage+1);updateCV();});
$('#cv-zoom').addEventListener('click',()=>{$('#cv-large').src='assets/cv-'+cvPage+'.png';$('#cv-large').alt='Original CV page '+cvPage+' enlarged';document.body.style.overflow='hidden';$('#cv-dialog').showModal();});updateCV();

let tourProgress=0;
function updateTour(){
  const section=$('.journey');
  section.style.height=reduceMotion()?'100svh':'640svh';
  const range=section.offsetHeight-window.innerHeight;
  tourProgress=reduceMotion()?0:Math.max(0,Math.min(1,window.scrollY/Math.max(1,range)));
  $('.header').classList.toggle('scrolled',window.scrollY>35);
  const lab=$('#motion-lab');const labRect=lab.getBoundingClientRect();
  $('.header').classList.toggle('over-lab',labRect.top<80&&labRect.bottom>80);
  lab.style.height=reduceMotion()?'100svh':'260svh';
  const chapters=[0,.19,.38,.58,.78,.96];let active=0;
  document.querySelectorAll('.chapter').forEach((el,i)=>{
    const distance=Math.abs(tourProgress-chapters[i]);let opacity=Math.max(0,1-distance/.145);
    if(i===5&&tourProgress>.96)opacity=1;
    if(reduceMotion())opacity=i===0?1:0;
    el.style.opacity=opacity;el.style.visibility=opacity>.02?'visible':'hidden';el.inert=opacity<.5;
    if(opacity>.5)active=i;
    el.style.transform='translateY('+((tourProgress-chapters[i])*90)+'px)';
  });
  $('#studio-chapter').textContent=['01 / THE STUDIO','02 / FORM','03 / PERSPECTIVE','04 / MOTION','05 / THE GALLERY','06 / SELECTED WORK'][active];
  document.querySelectorAll('[data-tour-stop]').forEach((el,i)=>{el.classList.toggle('active',i===active);el.setAttribute('aria-current',i===active?'step':'false');});
  $('#tour-percentage').textContent=String(Math.round(tourProgress*100)).padStart(2,'0');$('#tour-meter-fill').style.transform='scaleX('+tourProgress+')';
  document.body.dataset.tourChapter=String(active);
  window.dispatchEvent(new CustomEvent('studio-scroll',{detail:{progress:tourProgress,paused}}));
}
let scrollQueued=false;window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{updateTour();scrollQueued=false;});}},{passive:true});window.addEventListener('resize',updateTour);updateTour();
function updateMotion(){const button=$('#motion-toggle');button.textContent=reduceMotion()?'3D tour ↗':paused?'▶':'Ⅱ';button.style.width=reduceMotion()?'80px':'30px';button.style.borderRadius=reduceMotion()?'20px':'50%';button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',reduceMotion()?'Enable 3D studio tour':paused?'Resume studio animation':'Pause studio animation');button.title=button.getAttribute('aria-label');document.body.classList.toggle('full-motion',motionOverride);window.dispatchEvent(new CustomEvent('studio-motion',{detail:{paused,reduced:reduceMotion()}}));}
function enableTour(){motionOverride=true;paused=false;try{localStorage.setItem('nischaya-studio-motion','enabled');}catch{}updateMotion();updateTour();}
$('#motion-toggle').addEventListener('click',()=>{if(reduceMotion())enableTour();else{paused=!paused;updateMotion();updateTour();}});reduced.addEventListener('change',()=>{motionOverride=false;paused=reduced.matches;updateMotion();updateTour();});updateMotion();
function goToChapter(index){if(reduceMotion())enableTour();const range=$('.journey').offsetHeight-innerHeight;window.scrollTo({top:range*[0,.19,.38,.58,.78,.96][index],behavior:'smooth'});}
document.querySelectorAll('[data-tour-stop]').forEach(button=>button.addEventListener('click',()=>goToChapter(Number(button.dataset.tourStop))));
$('#enter-studio').addEventListener('click',()=>goToChapter(1));
$('.scroll-cue').addEventListener('click',event=>{event.preventDefault();goToChapter(1);});

try {
  const response=await fetch('assets/projects.json');if(!response.ok)throw new Error('Portfolio unavailable');
  const records=await response.json();const indices={skill:0,'3d':0,rive:0};
  projects=records.map((p,i)=>{const index=indices[p.category]++;const match=p.url.match(/\/file\/d\/([^/]+)/);const sourceTitle=p.sourceTitle?.replace(/\.mp4$/i,'').replace(/\s*\(1080p\).*$/i,'').trim();const fallback=p.category==='skill'?'ING Skill — '+String(index+1).padStart(2,'0'):p.category==='rive'?interactiveNames[index]:match?'3D study — '+String(index+1).padStart(2,'0'):'BIC interactive experience';return {...p,id:'project-'+i,driveId:match?.[1],video:!!match,title:sourceTitle||fallback};});
  // Lead with a 3D study, then move into the existing video and interactive collections.
  const featured=[projects[5],projects[0],projects[10],projects[6],projects[1]];projects=[...featured,...projects.filter(p=>!featured.includes(p))];renderProjects();
  $('#studio-hotspot').addEventListener('click', () => { window.open('https://drive.google.com/file/d/12ox3CcxohUIL9lxPKeQ1pffmforaWhV9/view?t=0.945', '_blank', 'noopener,noreferrer');});
}catch(error){$('#project-grid').innerHTML='<p>Explore the full collection on <a class="text-link" href="https://nischaya.framer.website/portfolio" target="_blank" rel="noopener">my existing portfolio ↗</a>.</p>';$('#show-more').hidden=true;console.warn(error.message);}

try{const {initStudio}=await import('./studio.js');await initStudio({projects,initialProgress:tourProgress,paused,reduced:reduceMotion()});}catch(error){document.body.classList.add('no-webgl');console.warn('Studio fallback active:',error.message);}
try{const {initMotionLab}=await import('./motion-lab.js');await initMotionLab({paused,reduced:reduceMotion()});}catch(error){document.body.classList.add('no-lab');console.warn('Motion study fallback active:',error.message);}

const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08});
document.querySelectorAll('.section-heading,.about-layout,.tool-row,.cv-layout').forEach(el=>{el.classList.add('reveal');observer.observe(el);});

// Tools mirror the visible portfolio controls when supported by the browser.
const context=document.modelContext;
if(context?.registerTool){const lifecycle=new AbortController();const register=(tool)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
register({name:'list_portfolio_projects',description:'List the projects available in this portfolio.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({projects:projects.map(({id,title,category,url})=>({id,title,category,url}))})});
register({name:'navigate_portfolio_section',description:'Navigate to the studio, Work, motion study, About, CV, or Contact.',inputSchema:{type:'object',properties:{section:{type:'string',enum:['home','work','motion-lab','about','cv','contact']}},required:['section'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:({section})=>{if(!['home','work','motion-lab','about','cv','contact'].includes(section))throw new Error('Unknown section');$('#'+section).scrollIntoView({behavior:'instant'});return{section};}});
register({name:'filter_portfolio_projects',description:'Apply the same category filter as the gallery controls.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['all','skill','3d','rive']}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:({category})=>{setFilter(category);return{category,count:projects.filter(p=>category==='all'||p.category===category).length};}});
window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
