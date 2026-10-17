const journeyOriginalSession=newLessonSession,journeyOriginalQuiz=quiz,journeyOriginalShell=shell,journeyOriginalSave=save;
newLessonSession=function(id){return {...journeyOriginalSession(id),phase:'learn',story:0,exampleLine:0,seen:[],demoBits:5,demoA:0,demoB:1}};
function journeyHUD(){
 const l=LESSONS.find(l=>l.id===session?.id);if(!l)return '';
 const earned=state.xp||0,level=1+Math.floor(earned/100),n=l.qs.length;
 return `<aside class="mission-hud" aria-label="Sua missão"><span>✦ Nível ${level}</span><strong>${earned} XP</strong><span>${session.phase==='learn'?'Aprenda → pratique':session.phase==='finished'?'Missão concluída ✓':`${session.q+1}/${n} · ${session.q<JOURNEY_DATA.base[l.id].qs.length?'Entender':CODE_LESSONS[l.id]&&session.q<JOURNEY_DATA.base[l.id].qs.length+2?'Completar':'Aplicar'}`}</span></aside>`;
}
function restoreJourneyData(v){
 const valid=key=>{const match=/^journey-1\/(.+)\/(\d+)$/.exec(key);const l=match&&LESSONS.find(l=>l.id===match[1]);return l&&+match[2]<l.qs.length};
 state.earned=Object.fromEntries(Object.entries(v.earned||{}).filter(([k,value])=>value===true&&valid(k)));state.xp=Object.keys(state.earned).length*10;
 state.drafts={};for(const [key,value] of Object.entries(v.drafts||{})){
  const match=/^(.+)\/(\d+)$/.exec(key),l=match&&LESSONS.find(l=>l.id===match[1]);if(!l||typeof value!=='string'||value.length>20000)continue;
  const q=!v.journeyVersion&&CODE_LESSONS[l.id]&&+match[2]<2?+match[2]+JOURNEY_DATA.base[l.id].qs.length+2:+match[2];
  if(STEPS[l.id][q]?.kind==='code')state.drafts[l.id+'/'+q]=value;
 }
 state.journeyVersion=1;if(COURSES.some(c=>c.id===v.course))state.course=v.course;
}
shell=function(html){journeyOriginalShell((session?journeyHUD():'')+html);document.body?.classList.remove('editor-focus');if(session?.phase==='finished'){
 const card=app.querySelector?.('.card');if(card){const reward=document.createElement('p');reward.className='mission-reward';reward.textContent='✦ '+LESSONS.find(l=>l.id===session.id).qs.length+' desafios resolvidos · Mais um passo na sua trilha';card.append(reward)}
}};
save=function(){
 if(session?.phase==='quiz'&&session.checked){
  if(session.correct){const k='journey-1/'+session.id+'/'+session.q;state.earned||={};if(!state.earned[k]){state.earned[k]=true;state.xp=(state.xp||0)+10;}}
 }
 journeyOriginalSave();
 const hud=document.querySelector('.mission-hud');if(hud&&session)hud.outerHTML=journeyHUD();
};
quiz=function(l){if(session.phase==='learn')return renderJourney(l);return journeyOriginalQuiz(l)};
const COURSE_COACH={
 digital:'Um número tem duas coisas diferentes: os algarismos escritos e o valor que eles representam. Em cada conta, identifique a base, alinhe as posições e só então aplique a operação. O zero pode não somar valor, mas continua ocupando uma posição.',
 algoritmos:'O computador segue as instruções na ordem escrita. Acompanhe o valor de cada variável depois de cada linha. Quando houver uma condição, escolha o bloco que realmente executa; quando houver um laço, repita o acompanhamento a cada volta.',
 web:'Pense em três camadas: HTML organiza o conteúdo, CSS controla a apresentação e JavaScript cria o comportamento. Antes de editar, identifique qual elemento será afetado e qual resultado você espera enxergar na página ou na saída.',
 dados:'Comece pela regra do mundo real, depois represente essa regra no modelo. Diferencie objetos, suas características e os vínculos entre eles. Ao trabalhar com tabelas, confira identificação, referências e quais linhas a operação deve afetar.'
};
function explainCodeLine(line,lang){
 const s=line.trim();if(!s)return 'Uma linha em branco separa partes do programa e facilita a leitura.';
 if(/^(#|\/\/|\/\*|<!--|--)/.test(s))return 'Comentário: orienta quem lê. Ele não faz parte das instruções executadas.';
 if(/^def |^function /.test(s))return 'Define uma função. Os nomes entre parênteses recebem os argumentos de cada chamada; o corpo descreve o que fazer com eles.';
 if(/^return\b/.test(s))return 'Devolve o resultado ao ponto que chamou a função. Isso é diferente de apenas mostrar um texto na tela.';
 if(/\bprint\(|console\.log\(/.test(s))return 'Mostra o valor da expressão na saída. '+(/\blen\(/.test(s)?'Aqui, len conta os itens da coleção ou os caracteres do texto; o número contado é o que será mostrado.':/\[\d+\]/.test(s)?'Os colchetes acessam uma posição. Lembre que o índice 0 é a primeira posição; descubra qual item será lido antes de imprimir.':'Para entender o resultado, descubra primeiro o valor que chega aos parênteses. Mostrar um valor não modifica a variável nem substitui um return.');
 if(/\binput\(/.test(s))return 'Recebe uma entrada como texto. Uma conversão como int permite fazer contas com esse dado.';
 if(/^if\b|^else\b/.test(s))return 'Escolhe um caminho. Confira a condição e observe o recuo ou as chaves que delimitam o bloco.';
 if(/^for\b|^while\b/.test(s))return 'Inicia uma repetição. Acompanhe o valor da variável em cada volta e confira como o laço termina.';
 if(/^with\b|\bopen\(/.test(s))return 'Abre um arquivo para uma operação. O modo determina o que é permitido; with ajuda a fechar o arquivo ao final do bloco.';
 if(/^import\b/.test(s))return 'Disponibiliza um módulo. Depois disso, suas funções podem ser acessadas pelo nome do módulo.';
 if(/\.append\(/.test(s))return 'Adiciona um item ao final da lista. A lista é alterada; não é necessário substituir seu nome pelo resultado de append.';
 if(/addEventListener/.test(s))return 'Registra uma função para responder a um evento. O comportamento acontece quando o evento ocorrer.';
 if(/getElementById|textContent/.test(s))return 'Localiza ou atualiza um elemento da página. Confira o id no HTML e diferencie o elemento do texto contido nele.';
 if(/^CREATE TABLE/i.test(s))return 'Define a estrutura de uma tabela. Observe cada coluna, seu tipo e suas restrições; ainda não é uma inserção de linhas.';
 if(/^INSERT/i.test(s))return 'Cria linhas. A ordem dos valores precisa corresponder à ordem das colunas indicadas.';
 if(/^UPDATE|^DELETE/i.test(s))return 'Altera ou remove linhas. Leia a condição WHERE antes de executar para prever quais registros serão afetados.';
 if(/^SELECT/i.test(s))return 'Consulta dados: SELECT escolhe o que mostrar, FROM indica a origem e WHERE pode filtrar as linhas.';
 if(/href=/.test(s))return 'Cria um link. href guarda o destino; o conteúdo entre a abertura e o fechamento de a é o texto visível.';
 if(/^<h[1-6]\b/.test(s))return 'Marca um título na hierarquia do documento. h1 é o título principal; h2 inicia uma seção abaixo dele. O texto entre as tags é o título que aparece na página.';
 if(/^<p\b/.test(s))return 'Cria um parágrafo. <p> inicia o elemento e </p> o fecha; o conteúdo entre as tags é o texto do parágrafo. Isso organiza o significado, não apenas o tamanho das letras.';
 if(/^<label\b/.test(s))return 'Identifica um campo do formulário. O valor de for deve corresponder ao id do input para associar o rótulo ao campo correto.';
 if(/^<input\b/.test(s))return 'Cria um campo de entrada. type escolhe seu tipo; id permite identificá-lo; required solicita preenchimento antes do envio pelo formulário.';
 if(/^<\//.test(s))return 'Fecha o elemento iniciado pela tag correspondente. Confira se as tags estão aninhadas na ordem correta.';
 if(/^</.test(s))return 'Marca um elemento HTML. O nome da tag indica sua função; os atributos acrescentam informações, como classe ou identificador.';
 if(/padding|margin/.test(s))return 'Ajusta o espaço da caixa. Padding fica dentro da borda; margin fica fora. Compare o valor e a unidade.';
 if(/color|background/.test(s))return 'Define uma cor. color afeta o texto; background ou background-color afeta o fundo.';
 if(/display|grid|flex/.test(s))return 'Controla o layout. Identifique o contêiner e observe como a regra distribui seus elementos filhos.';
 if(/position|top:|right:|bottom:|z-index/.test(s))return 'Controla posicionamento ou sobreposição. Confira qual é a referência usada para medir o deslocamento.';
 if(/^[.#][\w-]+\s*\{|\{\s*$/.test(s))return 'Abre um bloco de regras ou instruções. O seletor ou cabeçalho anterior define a que esse bloco se aplica.';
 if(s==='}'||s==='};')return 'Fecha o bloco aberto anteriormente. Confira o recuo para enxergar seu alcance.';
 if(/\+=/.test(s))return 'Atualiza um acumulador. x += valor significa x = x + valor: leia o valor anterior, some o aumento e guarde o resultado no mesmo nome.';
 if(/=/.test(s))return 'Primeiro calcule a expressão à direita. Depois guarde seu resultado na variável ou propriedade à esquerda. Se o nome já tinha um valor, a atribuição o substitui; = não é um teste de igualdade.';
 return 'Leia esta parte junto com a anterior. Identifique os dados usados e o efeito esperado antes de seguir para a próxima linha.';
}
function journeyExample(l){
 const doc=new DOMParser().parseFromString(l.body,'text/html');const pre=doc.querySelector('pre');
 if(pre){
  const lines=pre.textContent.trim().split('\n');session.exampleLine=Math.min(session.exampleLine,lines.length-1);
  return `<p>Toque em uma linha para entender sua função. Depois percorra o exemplo de cima para baixo.</p><div class="walkthrough-code">${lines.map((line,i)=>`<button class="walk-line ${i===session.exampleLine?'active':''}" data-walk="${i}" aria-pressed="${i===session.exampleLine}"><span>${i+1}</span><code>${escaped(line)||' '}</code></button>`).join('')}</div><div class="walk-explanation" aria-live="polite"><strong>Linha ${session.exampleLine+1}</strong><p>${escaped(explainCodeLine(lines[session.exampleLine],l.course))}</p></div><button class="secondary" id="walk-next">${session.exampleLine<lines.length-1?'Explorar próxima linha →':'Voltar à primeira linha ↺'}</button>`;
 }
 if(l.course==='digital'){
  if(['digital','portas','nand-nor','booleanas','tabela-expressao'].includes(l.id)){
   const a=session.demoA,b=session.demoB;return `<p>Altere as entradas e acompanhe cada operação. NOT inverte um bit; AND exige os dois; OR aceita pelo menos um.</p><div class="demo-controls"><button class="secondary" id="demo-a">Entrada A: ${a}</button><button class="secondary" id="demo-b">Entrada B: ${b}</button></div><div class="demo-trace"><div>A AND B <strong>${a&b}</strong></div><div>A OR B <strong>${a|b}</strong></div><div>NOT A <strong>${1-a}</strong></div><div>NOT(A AND B) <strong>${1-(a&b)}</strong></div></div><p class="tip">Neste estado, AND produz ${a&b} porque ${a&&b?'as duas entradas estão em 1':'pelo menos uma entrada está em 0'}. NAND inverte esse resultado para ${1-(a&b)}.</p>`;
  }
  const vals=[8,4,2,1],v=session.demoBits;return `<p>Toque nas posições para ligar e desligar os bits. Observe como o número muda sem alterar os pesos das posições.</p><div class="demo-binary">${vals.map(n=>`<button data-demo-bit="${n}" class="${v&n?'on':''}" aria-pressed="${!!(v&n)}"><strong>${v&n?1:0}</strong><small>peso ${n}</small></button>`).join('')}</div><div class="walk-explanation" aria-live="polite"><strong>${v.toString(2).padStart(4,'0')}₂ = ${v}₁₀</strong><p>${vals.filter(n=>v&n).join(' + ')||'Nenhum peso ligado'} = ${v}. Os zeros continuam ocupando suas posições, mas não acrescentam valor à soma.</p></div>`;
 }
 const q=JOURNEY_DATA.base[l.id].qs[0];return `<p>Vamos analisar um exemplo por partes. Tente prever a resposta antes de abrir a solução.</p><div class="example"><strong>${q.q}</strong></div><button class="secondary" id="reveal-example">${session.exampleOpen?'Ocultar solução':'Explorar a solução →'}</button>${session.exampleOpen?`<div class="walk-explanation" aria-live="polite"><strong>${escaped(q.o[q.a])}</strong><p>${q.why}</p><p>Agora separe a regra usada da resposta deste caso. Nos exercícios seguintes, você vai aplicar a regra em outro cenário.</p></div>`:''}`;
}
function renderJourney(l){
 const doc=new DOMParser().parseFromString(l.body,'text/html'),paragraphs=[...doc.querySelectorAll('p')].map(p=>p.outerHTML);
 const stage=session.story||0;
 const title=['Entenda antes de tentar','Explore um exemplo','Prepare sua missão'][stage];
 shell(`<section class="lesson-shell guided story-shell"><a class="back" href="#trilha/${l.course}">← Minha trilha</a><div class="eyebrow">${activeCourse().title} · EXPLICAÇÃO ${stage+1}/3</div><h1>${l.title}</h1><div class="story-dots" aria-label="Etapa da explicação">${[0,1,2].map(i=>`<span class="${i<=stage?'on':''}"></span>`).join('')}</div><article class="card learning-card"><span class="story-icon" aria-hidden="true">${['✦','⌘','⚑'][stage]}</span><h2>${title}</h2>${stage===0?`${paragraphs.slice(0,2).join('')}<div class="coach-note"><strong>Como pensar neste assunto</strong><p>${COURSE_COACH[l.course]}</p></div><button class="secondary" id="why-toggle">${session.whyOpen?'Fechar aprofundamento':'Quero entender melhor ↓'}</button>${session.whyOpen?`<div class="story-deeper">${l.body}</div>`:''}`:stage===1?journeyExample(l):`${paragraphs.slice(2).join('')||`<p>Não precisa decorar a resposta do exemplo. Refaça o raciocínio: identifique os dados, aplique a regra e confira o resultado.</p>`}<div class="mission-map">${CODE_LESSONS[l.id]?'<div><b>1</b><span>Reconheça o conceito<br><small>Perguntas para aquecer</small></span></div><div><b>2</b><span>Complete com apoio<br><small>2 desafios com código iniciado</small></span></div><div><b>3</b><span>Construa sua solução<br><small>2 desafios com menos ajuda</small></span></div>':'<div><b>1</b><span>Pratique a regra<br><small>Exercícios guiados</small></span></div><div><b>2</b><span>Transfira o que aprendeu<br><small>2 novos cenários para fixar</small></span></div>'}</div><div class="tip">Cada desafio resolvido pela primeira vez vale 10 XP. Você pode errar, ler a orientação e tentar quantas vezes precisar.</div>`}<div class="story-actions">${stage?'<button class="secondary" id="story-back">← Voltar</button>':''}<button class="primary" id="story-next">${stage===2?`Começar missão · ${l.qs.length} desafios →`:'Continuar explicação →'}</button></div></article></section>`);
 document.getElementById('story-next').onclick=()=>{if(stage===2){session.phase='quiz';session.q=0;quiz(l)}else{session.story++;renderJourney(l)}window.scrollTo(0,0)};
 const back=document.getElementById('story-back');if(back)back.onclick=()=>{session.story--;renderJourney(l);window.scrollTo(0,0)};
 const why=document.getElementById('why-toggle');if(why)why.onclick=()=>{session.whyOpen=!session.whyOpen;renderJourney(l)};
 const reveal=document.getElementById('reveal-example');if(reveal)reveal.onclick=()=>{session.exampleOpen=!session.exampleOpen;renderJourney(l)};
 document.querySelectorAll('[data-walk]').forEach(b=>b.onclick=()=>{session.exampleLine=+b.dataset.walk;renderJourney(l)});
 const walk=document.getElementById('walk-next');if(walk)walk.onclick=()=>{const total=doc.querySelector('pre').textContent.trim().split('\n').length;session.exampleLine=(session.exampleLine+1)%total;renderJourney(l)};
 document.querySelectorAll('[data-demo-bit]').forEach(b=>b.onclick=()=>{session.demoBits^=+b.dataset.demoBit;renderJourney(l)});
 for(const k of ['a','b']){const b=document.getElementById('demo-'+k);if(b)b.onclick=()=>{session[k==='a'?'demoA':'demoB']^=1;renderJourney(l)}}
}
if(!state.journeyVersion){
 if(state.drafts)for(const id of Object.keys(CODE_LESSONS))for(let i=0;i<2;i++){const old=id+'/'+i;if(state.drafts[old]!==undefined){state.drafts[id+'/'+(i+JOURNEY_DATA.base[id].qs.length+2)]=state.drafts[old];delete state.drafts[old]}}
 state.journeyVersion=1;save();
}
session=null;route();


