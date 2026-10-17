let codeRunCancel=null;
function stopCodeRun(){if(codeRunCancel){codeRunCancel();codeRunCancel=null}}
function codeDraftKey(l){return l.id+'/'+session.q}
function advanceGuidedLesson(l){
 if(!session.correct)return;session.q++;
 if(session.q>=l.qs.length){if(!state.done.includes(l.id))state.done.push(l.id);if(!session.mistakes)delete state.review[l.id];session.phase='finished';save();}
 else Object.assign(session,{selected:null,response:'',checked:false,correct:false,hint:false,feedback:'',output:'',codeKey:null});
 lesson(l.id);window.scrollTo(0,0);
}
function codeQuiz(l){
 const task=STEPS[l.id][session.q].code,last=session.q===l.qs.length-1,key=codeDraftKey(l);
 if(session.codeKey!==key){session.codeKey=key;session.response=state.drafts?.[key]??task.starter;session.inputs=task.inputs||'';session.output='';session.codeTab='editor';}
 const filename=({python:'main.py',sql:'consulta.sql',html:'index.html',css:'style.css',javascript:'main.js',dom:'main.js'})[task.lang];
 shell(`<div class="lesson-shell guided coding-lesson"><a class="back" href="#trilha/${l.course}">← Minha trilha</a><div class="lesson-topline"><span class="eyebrow">${activeCourse().title}</span><span class="pill">Desafio ${session.q+1} de ${l.qs.length}</span></div><h1>${l.title}</h1><div class="bar"><i style="width:${(session.q+(session.correct?1:0))/l.qs.length*100}%"></i></div><article class="card learning-card"><h2>Entenda a ideia</h2>${task.intro}<details class="lesson-details"><summary>Ver explicação completa da lição</summary>${l.body}</details><p class="note">${task.lang==='python'?'Python de estudo no aparelho (Skulpt). Módulos básicos; arquivos virtuais somente para leitura.':task.lang==='sql'?'SQL de estudo no aparelho (SQLite). O banco reinicia a cada execução. Alguns tipos e comandos diferem do PostgreSQL.':'A prévia fica isolada do aplicativo. Links e formulários não navegam para outros sites.'}</p><h2>Agora, escreva</h2><p class="code-prompt">${escaped(task.prompt)}</p>${task.markup?`<details class="support-html" open><summary>HTML de apoio</summary><pre><code>${escaped(task.markup)}</code></pre></details>`:''}<div class="editor-layout-controls"><span>Escreva, teste e ajuste</span><button type="button" id="editor-expand">⛶ Expandir editor</button></div><div class="code-tabs" role="tablist" aria-label="Editor e resultado"><button type="button" id="tab-editor" role="tab" aria-selected="true">${filename}</button><button type="button" id="tab-result" role="tab" aria-selected="false">${['html','css','dom'].includes(task.lang)?'Página / resultado':'Saída / resultado'}</button></div><section id="editor-panel" role="tabpanel" aria-labelledby="tab-editor"><label class="sr-only" for="code-editor">Seu código em ${filename}</label><div class="code-editor-wrap"><pre id="code-lines" aria-hidden="true"></pre><textarea id="code-editor" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" wrap="off" ${session.correct?'readonly':''}>${escaped(session.response)}</textarea></div><div class="code-tools"><button type="button" data-insert="    " aria-label="Inserir quatro espaços">⇥ Recuar</button>${['(',')','"',"'",':','{','}','<','>','[',']','=',';'].map(s=>`<button type="button" data-insert="${escaped(s)}">${escaped(s)}</button>`).join('')}</div>${task.lang==='python'?`<label class="field code-input-label">Entradas de teste (uma linha para cada input)<textarea id="code-inputs" rows="2" spellcheck="false">${escaped(session.inputs)}</textarea></label>${task.files?`<details open><summary>Arquivos virtuais disponíveis</summary>${Object.entries(task.files).map(([n,v])=>`<strong>${escaped(n)}</strong><pre>${escaped(v)}</pre>`).join('')}</details>`:''}`:''}</section><section id="result-panel" role="tabpanel" aria-labelledby="tab-result" hidden><div id="code-preview"></div><pre id="code-output" class="code-output">${escaped(session.output||'Execute seu código para ver o resultado.')}</pre></section><div id="answer-feedback" role="status" aria-live="polite">${session.feedback?`<div class="feedback ${session.correct?'':'error'}"><strong>${session.correct?'Você resolveu!':'Vamos ajustar esse passo.'}</strong><p class="code-feedback-text">${escaped(session.feedback)}</p></div>`:''}</div><div id="hint" class="tip" ${session.hint?'':'hidden'}><strong>Uma pista:</strong> ${escaped(task.hint)}</div><div class="exercise-actions">${session.correct?`<button class="primary" id="next">${last?'Concluir lição ✓':'Próximo exercício →'}</button>`:`<button class="primary" id="run-code">▶ Executar e conferir</button><button class="secondary" id="help">Preciso de uma dica</button><button class="secondary" id="reset-code">Recomeçar código</button>`}</div><p class="unlock-note">${session.correct?'Desafio resolvido. Você pode seguir quando quiser.':'O próximo desafio é liberado quando o código resolver o pedido.'}</p><p class="note">Rascunho salvo neste aparelho. ${l.sourceUrl?`<a href="${l.sourceUrl}" target="_blank" rel="noopener">Material da aula ↗</a>`:''}</p></article></div>`);
 const field=document.getElementById('code-editor'),lines=document.getElementById('code-lines');
 const numbers=()=>{lines.textContent=Array.from({length:field.value.split('\n').length},(_,i)=>i+1).join('\n');};numbers();
 const persist=()=>{session.response=field.value;if(field.value.length<=20000){state.drafts||={};state.drafts[key]=field.value;save()}numbers()};
 field.oninput=persist;field.onscroll=()=>{lines.scrollTop=field.scrollTop};
 const insert=text=>{if(session.correct||field.readOnly)return;field.setRangeText(text,field.selectionStart,field.selectionEnd,'end');persist();field.focus()};
 document.querySelectorAll('[data-insert]').forEach(b=>b.onclick=()=>insert(b.dataset.insert));
 field.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();insert('    ')}if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();document.getElementById('run-code')?.click()}};
 const expand=document.getElementById('editor-expand');if(expand)expand.onclick=()=>{const on=document.body.classList.toggle('editor-focus');expand.textContent=on?'↙ Voltar à lição':'⛶ Expandir editor'};
 const inputs=document.getElementById('code-inputs');if(inputs)inputs.oninput=()=>{session.inputs=inputs.value};
 const setTab=name=>{session.codeTab=name;document.getElementById('editor-panel').hidden=name!=='editor';document.getElementById('result-panel').hidden=name!=='result';document.getElementById('tab-editor').setAttribute('aria-selected',String(name==='editor'));document.getElementById('tab-result').setAttribute('aria-selected',String(name==='result'))};
 document.getElementById('tab-editor').onclick=()=>setTab('editor');document.getElementById('tab-result').onclick=()=>setTab('result');setTab(session.codeTab||'editor');
 const help=document.getElementById('help');if(help)help.onclick=()=>{session.hint=true;document.getElementById('hint').hidden=false};
 const reset=document.getElementById('reset-code');if(reset)reset.onclick=()=>{field.value=task.starter;persist();session.feedback='';document.getElementById('answer-feedback').textContent=''};
 const next=document.getElementById('next');if(next)next.onclick=()=>advanceGuidedLesson(l);
 const run=document.getElementById('run-code');if(run)run.onclick=async()=>{
  const current=session,source=field.value;if(source.length>20000){document.getElementById('answer-feedback').textContent='Use até 20.000 caracteres por desafio.';return}
  stopCodeRun();run.disabled=true;run.textContent='Executando…';field.readOnly=true;if(inputs)inputs.disabled=true;reset.disabled=true;setTab('result');
  const result=await executeCodeTask(task,source,session.inputs,document.getElementById('code-preview'));
  if(session!==current||codeDraftKey(l)!==key||result.cancelled)return;
  field.readOnly=false;if(inputs)inputs.disabled=false;reset.disabled=false;
  session.output=result.output||'';session.checked=true;session.correct=result.ok;session.feedback=result.message;state.answers++;
  if(result.ok)state.correct++;else{session.mistakes++;state.review[l.id]=true;}save();
  // Keep the working preview alive while updating the feedback and actions.
  document.getElementById('code-output').textContent=session.output||'Sem saída.';
  document.getElementById('answer-feedback').innerHTML=`<div class="feedback ${result.ok?'':'error'}"><strong>${result.ok?'Você resolveu!':'Vamos ajustar esse passo.'}</strong><p class="code-feedback-text">${escaped(result.message)}</p></div>`;
  run.disabled=false;run.textContent='▶ Executar e conferir';setTab('result');
  if(result.ok){field.readOnly=true;run.id='next';run.textContent=last?'Concluir lição ✓':'Próximo exercício →';run.onclick=()=>advanceGuidedLesson(l);document.getElementById('help').hidden=true;document.getElementById('reset-code').hidden=true;document.querySelector('.unlock-note').textContent='Desafio resolvido. Você pode seguir quando quiser.';}
 };
}
function executeCodeTask(task,code,inputs,preview){
 if(['html','css','dom'].includes(task.lang))return runWebPreview(task,code,preview);
 return new Promise(resolve=>{
  let worker,ended=false;const finish=result=>{if(ended)return;ended=true;clearTimeout(timer);worker?.terminate();codeRunCancel=null;resolve(result)};
  const timer=setTimeout(()=>finish({ok:false,message:'A execução demorou demais e foi interrompida. Confira seus laços ou consultas e tente novamente.'}),7000);
  codeRunCancel=()=>finish({cancelled:true});
  try{worker=new Worker('code-worker.js');worker.onmessage=e=>finish(e.data);worker.onerror=()=>finish({ok:false,message:'Não foi possível iniciar o ambiente. Conecte-se à internet, atualize as lições e tente novamente.'});worker.postMessage({task,code,inputs});}catch{finish({ok:false,message:'Este navegador não iniciou o editor. Abra o endereço publicado do Passo no Safari.'})}
 });
}
function runWebPreview(task,code,container){
 return new Promise(resolve=>{
  const frame=document.createElement('iframe');frame.title='Resultado do seu código';frame.setAttribute('sandbox','allow-scripts');frame.className='code-preview-frame';container.replaceChildren(frame);
  const token=crypto.randomUUID();let ended=false;
  const finish=r=>{if(ended)return;ended=true;clearTimeout(timer);window.removeEventListener('message',receive);codeRunCancel=null;resolve(r)};
  const receive=e=>{if(e.source===frame.contentWindow&&e.data?.token===token)finish(e.data.result)};
  window.addEventListener('message',receive);const timer=setTimeout(()=>{frame.remove();finish({ok:false,message:'A página não concluiu o teste. Confira seu código e tente novamente.'})},5000);codeRunCancel=()=>{frame.remove();finish({cancelled:true})};
  const checks=`
const task=${JSON.stringify(task).replace(/</g,'\\u003c')};
function verify(){
 try { for(const t of task.tests){ const el=document.querySelector(t.selector);if(!el)throw Error('Não encontramos '+t.selector+'. '+task.hint);
 if(t.beforeText!==undefined&&el.textContent.trim()!==t.beforeText)throw Error('A mensagem deve esperar o clique antes de mudar.');
 if(t.click){const b=document.querySelector(t.click);if(!b)throw Error('Faltou o botão '+t.click);b.click();}
 if(t.text!==undefined&&el.textContent.trim()!==t.text)throw Error('Em '+t.selector+', esperávamos "'+t.text+'". Obtido: "'+el.textContent.trim()+'".');
 if(t.nonempty&&!el.textContent.trim())throw Error('Adicione texto a '+t.selector+'.');
 if(t.link&&(!/^https:\\/\\//i.test(el.getAttribute('href')||'')||!el.textContent.trim()))throw Error('O link precisa de href iniciado por https:// e texto visível.');
 if(t.required&&!el.required)throw Error('O campo '+t.selector+' precisa de required.');
 if(t.attribute&&el.getAttribute(t.attribute)!==t.value)throw Error('Confira '+t.attribute+' de '+t.selector+'. Esperado: '+t.value);
 if(t.style&&getComputedStyle(el)[t.style]!==t.value)throw Error('Confira '+t.style+' em '+t.selector+'. Esperado: '+t.value+'; obtido: '+getComputedStyle(el)[t.style]+'.');
 if(t.equalColumns){const cols=getComputedStyle(el).gridTemplateColumns.split(' ');if(cols.length!==2||Math.abs(parseFloat(cols[0])-parseFloat(cols[1]))>1)throw Error('Crie duas colunas de tamanho igual.');}
 } parent.postMessage({token:${JSON.stringify(token)},result:{ok:true,output:'Página renderizada. Verificações concluídas.',message:'Seu código passou nas verificações deste desafio.'}},'*');
 }catch(e){parent.postMessage({token:${JSON.stringify(token)},result:{ok:false,message:e.message+'\\nDica: '+task.hint}},'*');}
}
window.addEventListener('error',e=>parent.postMessage({token:${JSON.stringify(token)},result:{ok:false,message:'Erro de JavaScript: '+e.message+' (linha '+e.lineno+'). Confira nomes, aspas e parênteses.'}},'*'));
document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault()},true);document.addEventListener('submit',e=>e.preventDefault(),true);
window.addEventListener('load',()=>setTimeout(verify,30));`;
  // Parse HTML inertly, remove executable/network-bearing elements and handlers.
  const doc=new DOMParser().parseFromString(task.lang==='html'?code:task.markup,'text/html');
  doc.querySelectorAll('script,iframe,object,embed,link,meta,base,audio,video,source').forEach(el=>el.remove());
  doc.querySelectorAll('*').forEach(el=>{for(const a of [...el.attributes])if(/^on/i.test(a.name)||['src','srcset','action','formaction'].includes(a.name))el.removeAttribute(a.name)});
  const css=task.lang==='css'?code:'';
  frame.srcdoc='<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; connect-src \'none\'; form-action \'none\'"><style>body{font:16px system-ui;padding:16px;color:#17211d;background:white}button,input{font:inherit}'+css.replace(/<\/style/gi,'')+'</style></head><body>'+doc.body.innerHTML+'<script>'+checks+'<\/script>'+(task.lang==='dom'?'<script>'+code.replace(/<\/script/gi,'')+'<\/script>':'')+'</body></html>';
 });
}

