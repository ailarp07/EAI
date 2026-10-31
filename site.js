// ponytail: swaps innerHTML between data-th and the original English. Fine for a few static pages; move to one shared dictionary file once pages share strings.
(function(){
  document.documentElement.classList.add('js');
  // phone menu footer: two icon links (photo drive, Linktree) and the social icons (injected once so every page shares it)
  var mx=document.getElementById('menu');
  if(mx){
    var x=document.createElement('div');x.className='menu-extra';
    x.innerHTML='<div class="mx-links">'
      +'<a href="https://spsm20-my.sharepoint.com/:f:/g/personal/024329_spsm_ac_th/IgDw9z82yVOeQYJz6jOnt_ykAazdCh2dPsaIH8VWcLLRIJM?e=9gAvi4" target="_blank" rel="noopener"><span class="mm">SharePoint</span><img class="mb" src="assets/ph/images.svg" alt=""><b data-th="ไดรฟ์รูปภาพ">Photo drive</b><span class="ml"><span data-th="เปิด">Open</span><img src="assets/ph/arrow-up-right.svg" alt=""></span></a>'
      +'<a href="https://linktr.ee/eaisatitpsm" target="_blank" rel="noopener"><span class="mm" data-th="ลิงก์ทั้งหมด">All links</span><img class="mb" src="assets/ph/link-simple.svg" alt=""><b>Linktree</b><span class="ml"><span data-th="เปิด">Open</span><img src="assets/ph/arrow-up-right.svg" alt=""></span></a>'
      +'</div>'
      +'<p class="mx-cap" data-th="ติดตามเรา">Follow us</p>'
      +'<div class="mx-soc">'
      +'<a href="https://bit.ly/3jFACxV" target="_blank" rel="noopener" aria-label="LINE Openchat"><img src="assets/bi/line.svg" alt=""></a>'
      +'<a href="https://www.instagram.com/e.ai_official/" target="_blank" rel="noopener" aria-label="Instagram"><img src="assets/ph/instagram-logo.svg" alt=""></a>'
      +'<a href="https://www.facebook.com/eaispsm" target="_blank" rel="noopener" aria-label="Facebook"><img src="assets/ph/facebook-logo.svg" alt=""></a>'
      +'<a href="https://www.tiktok.com/@e.ai_official" target="_blank" rel="noopener" aria-label="TikTok"><img src="assets/ph/tiktok-logo.svg" alt=""></a>'
      +'<a href="https://github.com/eai-spsm" target="_blank" rel="noopener" aria-label="GitHub"><img src="assets/ph/github-logo.svg" alt=""></a>'
      +'</div>';
    mx.appendChild(x);
  }
  // unofficial-site notice: once per browser session, on every page
  var seen=false;try{seen=sessionStorage.getItem('eai-notice')}catch(e){}
  if(!seen){
    var nb=document.createElement('div');nb.className='notice';nb.setAttribute('role','dialog');nb.setAttribute('aria-modal','true');nb.setAttribute('aria-labelledby','nt');
    nb.innerHTML='<div class="nbox"><img class="ic" src="assets/ph/info.svg" alt=""><h2 id="nt" data-th="นี่ไม่ใช่เว็บไซต์ทางการ">This is not an official website</h2>'
      +'<p data-th="เว็บไซต์นี้ไม่ใช่เว็บไซต์ทางการของโรงเรียนหรือวิชาเอก เป็นเพียงงานที่นักเรียนของวิชาเอกสร้างขึ้นใหม่">This is only a recreation made by a student of the major. It is not the official website of the school or the major.</p>'
      +'<button class="btn" type="button"><span data-th="รับทราบ">Acknowledge</span></button></div>';
    document.body.appendChild(nb);
    var nclose=function(){nb.remove();document.removeEventListener('keydown',nkey);try{sessionStorage.setItem('eai-notice','1')}catch(e){}};
    var nkey=function(e){if(e.key==='Escape')nclose()};
    nb.querySelector('button').onclick=nclose;
    nb.onclick=function(e){if(e.target===nb)nclose()};
    document.addEventListener('keydown',nkey);
    nb.querySelector('button').focus();
  }
  // nav: transparent over the home hero, solid white once the page scrolls
  var navEl=document.querySelector('.nav');
  // solid white nav everywhere except while it sits over a dark photo section (home hero and career section); the wave edges count as white
  var dc=document.documentElement.classList,darkSecs=dc.contains('home')?document.querySelectorAll('.statement,#after'):dc.contains('hero-page')?document.querySelectorAll('.hero-c'):[];
  function navSolid(){
    if(!navEl)return;
    var y=navEl.offsetHeight/2,over=false;
    darkSecs.forEach(function(s){var r=s.getBoundingClientRect(),top=s.id==='after'?80:0,bot=s.classList.contains('hero-c')?0:80;if(r.top+top<=y&&r.bottom-bot>=y)over=true});
    navEl.classList.toggle('solid',!over);
  }
  window.addEventListener('scroll',navSolid,{passive:true});window.addEventListener('resize',navSolid);window.addEventListener('load',navSolid);navSolid();
  // photo viewer for the justified grid: click to enlarge, arrows / Esc to move and close, caption shows title and position
  var jgs=[].slice.call(document.querySelectorAll('.jg a'));
  if(jgs.length){
    var lb=null,li=0,grp=[];
    var show=function(i){li=(i+grp.length)%grp.length;var a=grp[li],f=a.parentNode,t=f.querySelector('figcaption b');lb.querySelector('img').src=a.href;lb.querySelector('.cp').textContent=(t?t.textContent:'')+' #'+(li+1)+' / '+grp.length};
    var shut=function(){if(lb){lb.remove();lb=null;document.body.style.overflow='';document.removeEventListener('keydown',key)}};
    var key=function(e){if(e.key==='Escape')shut();else if(e.key==='ArrowRight')show(li+1);else if(e.key==='ArrowLeft')show(li-1)};
    jgs.forEach(function(a){a.onclick=function(e){e.preventDefault();grp=[].slice.call(a.closest('.jg').querySelectorAll('a'));lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
      lb.innerHTML='<button class="cl" type="button" aria-label="Close">&times;</button><button class="pv" type="button" aria-label="Previous">&#8249;</button><img alt=""><div class="cp"></div><button class="nx" type="button" aria-label="Next">&#8250;</button>';
      lb.onclick=function(ev){if(ev.target===lb)shut()};lb.querySelector('.cl').onclick=shut;lb.querySelector('.pv').onclick=function(){show(li-1)};lb.querySelector('.nx').onclick=function(){show(li+1)};
      document.body.appendChild(lb);document.body.style.overflow='hidden';document.addEventListener('keydown',key);show(grp.indexOf(a))}});
  }
  // fade sections up as they scroll into view
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.2});rv.forEach(function(e){io.observe(e)})}else{rv.forEach(function(e){e.classList.add('in')})}
  var $=function(s,r){return(r||document).querySelectorAll(s)},items=$('[data-th]'),lt=document.getElementById('lang-t'),menu=document.getElementById('menu'),burger=document.getElementById('burger');
  function set(l){
    items.forEach(function(e){if(e.dataset.en==null)e.dataset.en=e.innerHTML;e.innerHTML=l==='th'?e.dataset.th:e.dataset.en});
    document.documentElement.lang=l;var pi=document.getElementById('rsearch');if(pi){if(!pi.dataset.phEn)pi.dataset.phEn=pi.placeholder;pi.placeholder=l==='th'?pi.dataset.phTh:pi.dataset.phEn}lt.textContent=l==='th'?'EN':'TH';
    try{localStorage.setItem('eai-lang',l)}catch(e){}
  }
  document.getElementById('lang').onclick=function(){set(document.documentElement.lang==='th'?'en':'th')};
  var nav=document.querySelector('.nav');
  function openMenu(o){menu.classList.toggle('open',o);nav.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);burger.firstChild.src='assets/bi/'+(o?'plus-lg':'list-ul')+'.svg';burger.firstChild.style.transform=o?'rotate(45deg)':'';document.body.style.overflow=o?'hidden':''}
  burger.onclick=function(){openMenu(!menu.classList.contains('open'))};
  $('.dd>button').forEach(function(b){b.onclick=function(e){
    var d=b.parentNode,o=d.classList.contains('open');
    $('.dd.open').forEach(function(x){x.classList.remove('open');x.firstElementChild.setAttribute('aria-expanded','false')});
    if(!o){d.classList.add('open');b.setAttribute('aria-expanded','true')}
    e.stopPropagation()}});
  document.addEventListener('click',function(e){
    if(!e.target.closest('.dd'))$('.dd.open').forEach(function(x){x.classList.remove('open')});
    if(e.target.closest('.menu a'))openMenu(false);
  });
  $('.q').forEach(function(b){b.onclick=function(){var o=b.parentNode.classList.toggle('open');b.setAttribute('aria-expanded',o)}});
  // rotators ("After this major, I am ..." and "Where our alumni go"): every [data-i] layer in a .iam shares one index; auto-advances, pauses on hover or click
  $('.iam').forEach(function(box){
    var cur=0,tm,rs,n=box.querySelectorAll('.pick').length;
    function go(i){cur=i;box.querySelectorAll('[data-i]').forEach(function(e){e.classList.toggle('on',+e.dataset.i===i)})}
    function start(){clearInterval(tm);if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches)tm=setInterval(function(){go((cur+1)%n)},1600)}
    box.querySelectorAll('.pick').forEach(function(b){b.onclick=function(){go(+b.dataset.i);clearInterval(tm);clearTimeout(rs);rs=setTimeout(start,6000)}});
    box.querySelectorAll('.arr').forEach(function(b){b.onclick=function(){go((cur+ +b.dataset.dir+n)%n);clearInterval(tm);clearTimeout(rs);rs=setTimeout(start,6000)}});
    box.onmouseenter=function(){clearInterval(tm)};box.onmouseleave=start;start();
  });
  $('.tabs').forEach(function(t){var bs=t.querySelectorAll('.tb'),ps=t.parentNode.querySelectorAll('.tp');bs.forEach(function(b,i){b.onclick=function(){bs.forEach(function(x,k){x.classList.toggle('on',k===i)});ps.forEach(function(x,k){x.classList.toggle('on',k===i)})}})});
  // alumni search: filters every row; while searching, all generations show and empty ones hide
  var rsb=document.getElementById('rsearch');
  if(rsb){
    var q0=new URLSearchParams(location.search).get('q');
    var box2=document.querySelector('.rosterbox'),rc=document.getElementById('rcount');
    rsb.oninput=function(){
      var q=rsb.value.toLowerCase().trim(),n=0;
      box2.classList.toggle('searching',!!q);
      box2.querySelectorAll('.tp').forEach(function(p){
        var hit=0;p.querySelectorAll('tbody tr').forEach(function(r){var ok=!q||r.dataset.s.indexOf(q)>-1;r.classList.toggle('hide',!ok);if(ok)hit++});
        p.classList.toggle('empty',!!q&&!hit);n+=hit;
      });
      rc.textContent=q?n+(document.documentElement.lang==='th'?' รายการ':' results'):'';
    };
    if(q0){rsb.value=q0;rsb.oninput()}
  }
  // by-university bars: hover links a segment and its row (red, rest dim); click jumps to the names; numbers count up
  var bu=document.querySelector('.byuni');
  if(bu){
    bu.querySelectorAll('[data-k]').forEach(function(e){
      e.onmouseenter=function(){bu.classList.add('hov');bu.querySelectorAll('[data-k="'+e.dataset.k+'"]').forEach(function(x){x.classList.add('hl')})};
      e.onmouseleave=function(){bu.classList.remove('hov');bu.querySelectorAll('.hl').forEach(function(x){x.classList.remove('hl')})};
      e.onclick=function(){var k=e.dataset.k.toLowerCase(),b=document.getElementById('rsearch');if(k==='others'||k==='none')return;if(!b){location.href='alumni.html?q='+encodeURIComponent(k);return}b.value=k;b.oninput();document.getElementById('roster').scrollIntoView({behavior:'smooth'})};
    });
    var calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    bu.querySelectorAll('.sum b').forEach(function(b){
      var m=b.textContent.match(/^(\d+)(.*)$/);if(!m||calm)return;var to=+m[1],suf=m[2],t0=null;
      function f(t){t0=t0||t;var k=Math.min(1,(t-t0)/900);b.textContent=Math.round(to*(1-Math.pow(1-k,3)))+suf;if(k<1)requestAnimationFrame(f)}
      new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();requestAnimationFrame(f)}},{threshold:.4}).observe(b);
    });
  }
  // countdown to Open House, 24 Jan 2027 00:00 Bangkok time
  var T=new Date('2027-01-24T00:00:00+07:00').getTime(),el={};
  $('[data-c]').forEach(function(e){el[e.dataset.c]=e});
  function p(n){return n<10?'0'+n:''+n}
  function tick(){
    var s=Math.max(0,Math.floor((T-Date.now())/1000));
    el.d.textContent=Math.floor(s/86400);el.h.textContent=p(Math.floor(s%86400/3600));el.m.textContent=p(Math.floor(s%3600/60));el.s.textContent=p(s%60);
  }
  if(el.d){tick();setInterval(tick,1000)}
  try{if(localStorage.getItem('eai-lang')==='th')set('th')}catch(e){}
})();
