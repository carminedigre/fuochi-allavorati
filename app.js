const tabs=[...document.querySelectorAll('[role="tab"]')];
document.querySelectorAll('.day').forEach(panel => { panel.hidden = panel.id !== 'day-6'; });
document.querySelector('.program').classList.add('program-ready');
function selectTab(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=tabs[(index+1)%tabs.length];if(event.key==='ArrowLeft')next=tabs[(index+tabs.length-1)%tabs.length];if(event.key==='Home')next=tabs[0];if(event.key==='End')next=tabs[tabs.length-1];if(next){event.preventDefault();selectTab(next);next.focus();}});});

const music = document.getElementById('background-music');
const musicToggle = document.querySelector('.music-toggle');
const musicIcon = musicToggle.querySelector('span');
const musicPlayedKey = 'background-music-played';
const firstClick = new AbortController();

function hasPlayedMusic() {
  try {
    return localStorage.getItem(musicPlayedKey) === 'true';
  } catch {
    return false;
  }
}

function playMusic() {
  // Audible playback can be blocked until the visitor interacts with the page.
  music.play().catch(() => {});
}

function updateMusicToggle() {
  const active = !music.paused && !music.ended;
  musicToggle.setAttribute('aria-pressed', String(active));
  musicIcon.textContent = active ? '❚❚' : '♫';
}

music.volume = 0.3;
musicToggle.hidden = false;
music.addEventListener('play', updateMusicToggle);
music.addEventListener('pause', updateMusicToggle);
music.addEventListener('ended', updateMusicToggle);
music.addEventListener('playing', () => {
  firstClick.abort();
  try {
    localStorage.setItem(musicPlayedKey, 'true');
  } catch {
    // Playback also works when browser storage is unavailable.
  }
}, { once: true });

musicToggle.addEventListener('click', () => {
  firstClick.abort();
  if (music.paused || music.ended) playMusic();
  else music.pause();
});

if (!hasPlayedMusic()) {
  document.addEventListener('click', event => {
    if (!event.isTrusted) return;
    firstClick.abort();
    if (music.paused && !hasPlayedMusic()) playMusic();
  }, { signal: firstClick.signal });
  playMusic();
}
