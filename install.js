(() => {
  'use strict';
  const button=document.getElementById('install-invitation');
  const help=document.getElementById('install-help');
  const instructions=document.getElementById('install-instructions');
  const status=document.getElementById('offline-status');
  const standalone=window.matchMedia('(display-mode: standalone)');
  let installPrompt;
  const installed=()=>standalone.matches||window.navigator.standalone===true;
  // Match the illustration's edge colours around the visible image itself.
  document.querySelectorAll('.ceremony-image').forEach(image=>{
    const size=()=>{const r=image.getBoundingClientRect();image.parentElement.style.setProperty('--art-width',r.width+'px');image.parentElement.style.setProperty('--art-height',r.height+'px');};
    image.addEventListener('load',size);if(image.complete)size();
    if('ResizeObserver' in window)new ResizeObserver(size).observe(image);
  });
  function updateInstall(){button.hidden=installed();}
  updateInstall();
  standalone.addEventListener('change',updateInstall);
  window.addEventListener('appinstalled',()=>{installPrompt=null;button.hidden=true;});
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;updateInstall();});
  button.addEventListener('click',async()=>{
    if(installPrompt){
      const prompt=installPrompt;installPrompt=null;
      await prompt.prompt();
      const choice=await prompt.userChoice;
      if(choice.outcome==='accepted')button.hidden=true;
      return;
    }
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const inApp=/WhatsApp|FBAN|FBAV|Instagram/.test(navigator.userAgent);
    instructions.textContent=inApp
      ? 'इस आमंत्रण को आईफ़ोन में सफ़ारी या एंड्रॉइड में क्रोम में खोलें। फिर शेयर या ब्राउज़र मेनू से होम स्क्रीन पर जोड़ें चुनें।'
      : ios
        ? 'सफ़ारी में शेयर पर स्पर्श करें, फिर होम स्क्रीन पर जोड़ें चुनें। विकल्प दिखने पर वेब ऐप के रूप में खोलें चालू करें और जोड़ें चुनें।'
        : 'ब्राउज़र मेनू में ऐप इंस्टॉल करें या होम स्क्रीन पर जोड़ें चुनें। पुष्टि करने पर आमंत्रण आपके फ़ोन में सहेज दिया जाएगा।';
    help.showModal();
  });
  document.getElementById('close-install-help').addEventListener('click',()=>help.close());
  help.addEventListener('click',event=>{if(event.target===help){const r=help.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)help.close();}});
  if('serviceWorker' in navigator&&window.isSecureContext){
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})
      .then(()=>navigator.serviceWorker.ready)
      .then(()=>new Promise(resolve=>{
        const controlled=()=>{if(navigator.serviceWorker.controller){navigator.serviceWorker.removeEventListener('controllerchange',controlled);resolve();}};
        navigator.serviceWorker.addEventListener('controllerchange',controlled);controlled();
      }))
      .then(()=>{status.textContent='आमंत्रण ऑफ़लाइन उपलब्ध है';})
      .catch(()=>{status.textContent='आमंत्रण खोलते समय इंटरनेट से जुड़ें';});
  }else status.textContent='';
})();
