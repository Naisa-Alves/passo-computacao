(() => {
 if(!['https:','http:'].includes(location.protocol)||!('serviceWorker' in navigator))return;
 const panel=document.createElement('aside');
 panel.className='pwa-panel';panel.setAttribute('aria-label','Instalação e acesso offline');
 panel.innerHTML='<span id="offline-status" role="status">Preparando acesso offline…</span><button type="button" id="install-help">Instalar no celular</button>';
 document.body.append(panel);
 const status=document.getElementById('offline-status');
 const dialog=document.createElement('dialog');dialog.className='install-dialog';
 dialog.innerHTML='<h2>Passo no seu iPhone</h2><ol><li>Abra este endereço no <strong>Safari</strong>.</li><li>Toque em <strong>Compartilhar</strong>.</li><li>Escolha <strong>Adicionar à Tela de Início</strong>.</li><li>Ative <strong>Abrir como App</strong>, se aparecer, e toque em Adicionar.</li></ol><p>Abra pelo novo ícone e espere aparecer “Lições disponíveis offline”. Depois disso, as lições e exercícios deste aparelho poderão abrir sem internet. Links externos, incluindo Moodle, precisam de conexão.</p><p>O progresso fica neste aparelho. Exporte uma cópia na aba Progresso para guardar ou transferir.</p><button class="primary" type="button">Entendi</button>';
 document.body.append(dialog);
 document.getElementById('install-help').onclick=()=>dialog.showModal();
 dialog.querySelector('button').onclick=()=>dialog.close();
 const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 if(standalone)document.getElementById('install-help').textContent='App instalado ✓';
 let reloading=false,registration;
 function showStatus(ready){status.dataset.ready=ready?'yes':'no';status.textContent=ready?(navigator.onLine?'Lições disponíveis offline ✓':'Sem conexão · lições disponíveis ✓'):'Offline ainda não preparado. Conecte-se e tente novamente.'}
 function checkOffline(){
  const worker=navigator.serviceWorker.controller||registration?.active;
  if(worker)worker.postMessage({type:'OFFLINE_STATUS'});
 }
 navigator.serviceWorker.addEventListener('message',event=>{
  if(event.data?.type==='OFFLINE_STATUS')showStatus(event.data.ready===true);
 });
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(reloading){location.reload();return}checkOffline();
 });
 function showUpdate(reg){
  if(!reg.waiting||document.getElementById('pwa-update'))return;
  const b=document.createElement('button');b.id='pwa-update';b.textContent='Atualizar lições';b.type='button';
  b.onclick=()=>{try{save()}catch{}reloading=true;reg.waiting.postMessage({type:'SKIP_WAITING'})};panel.append(b);
 }
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async reg=>{
  registration=reg;showUpdate(reg);
  reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){if(navigator.serviceWorker.controller)showUpdate(reg);else navigator.serviceWorker.ready.then(checkOffline)}})});
  await navigator.serviceWorker.ready;checkOffline();
 }).catch(()=>{status.textContent='Não foi possível preparar o modo offline. Você ainda pode estudar com conexão.'});
 window.addEventListener('online',()=>{checkOffline();registration?.update().catch(()=>{})});
 window.addEventListener('offline',checkOffline);
})();
