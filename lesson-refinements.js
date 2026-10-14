// Refinements from learner feedback, applied after the generated curriculum.
(() => {
 const lesson=LESSONS.find(l=>l.id==='web-css');
 lesson.time=8;
 const selectors=`<p><strong>CSS muda a aparência do HTML</strong>: cores, tamanhos e espaços. Uma regra tem duas partes: <strong>quem será alterado</strong> e <strong>o que será alterado</strong>.</p>
 <div class="example"><strong>Primeiro, entenda o HTML:</strong><pre><code>&lt;p class="aviso"&gt;Estude um pouco por dia.&lt;/p&gt;</code></pre><p><code>p</code> cria um parágrafo. <code>class="aviso"</code> coloca a etiqueta <strong>aviso</strong> nesse parágrafo. Vários elementos podem receber a mesma classe.</p></div>
 <p>Agora podemos escolher essa classe no CSS. <strong>O ponto antes do nome significa “elementos com esta classe”</strong>.</p>
 <pre><code>.aviso {
   color: blue;
 }</code></pre>
 <ol><li><code>.aviso</code> é o <strong>seletor</strong>: escolhe os elementos com <code>class="aviso"</code>.</li><li><code>color</code> é a propriedade: muda a <strong>cor do texto</strong>.</li><li><code>blue</code> é o valor: o texto ficará <strong>azul</strong>. As chaves guardam as declarações da regra.</li></ol>
 <table><tr><th>Seletor CSS</th><th>O que escolhe no HTML</th></tr><tr><td><code>.aviso</code></td><td>Elementos com <code>class="aviso"</code></td></tr><tr><td><code>#titulo</code></td><td>O elemento com <code>id="titulo"</code></td></tr><tr><td><code>p</code></td><td>Todos os parágrafos</td></tr></table>
 <div class="example"><strong>Exemplo resolvido</strong><p>Se dois parágrafos têm <code>class="aviso"</code>, a regra <code>.aviso { color: blue; }</code> deixa o texto dos dois azul. Um parágrafo sem essa classe não é selecionado por essa regra.</p></div>
 <p><strong>Para resolver o exercício:</strong> observe o símbolo antes de <code>destaque</code>. Ponto seleciona classe; <code>#</code> seleciona id; o nome da tag seleciona aquele tipo de elemento.</p>`;
 const spacing=`<p>Imagine que cada elemento da página fica dentro de uma <strong>caixa</strong>. De dentro para fora, temos:</p>
 <ol><li><strong>Conteúdo:</strong> texto ou imagem.</li><li><strong>Padding:</strong> espaço entre o conteúdo e a borda.</li><li><strong>Borda:</strong> contorno da caixa.</li><li><strong>Margin:</strong> espaço do lado de fora, separando a caixa das outras.</li></ol>
 <div class="box-model-demo" role="img" aria-label="Caixa: margin fica fora da borda; padding fica dentro da borda, ao redor do conteúdo."><div class="box-margin-label">MARGIN · espaço externo</div><div class="box-border-demo"><div class="box-padding-label">BORDA · contorno verde</div><div class="box-padding-label">PADDING · espaço interno</div><div class="box-content-demo">CONTEÚDO</div></div></div>
 <div class="example"><strong>Exemplo resolvido:</strong><pre><code>.cartao {
   border: 2px solid green;
   padding: 20px;
   margin: 10px;
 }</code></pre><p>O cartão tem uma borda verde de 2 pixels. <code>padding: 20px</code> afasta o texto da borda <strong>por dentro</strong>. <code>margin: 10px</code> cria espaço <strong>por fora</strong>. <code>px</code> significa pixels, uma unidade de medida usada no CSS.</p></div>
 <p><code>color</code> muda a cor do texto; <code>background-color</code> muda o fundo. Nenhuma dessas propriedades cria o espaço interno ou externo.</p>
 <p><strong>Para resolver o exercício:</strong> identifique de qual lado da borda o espaço deve ficar.</p>`;
 lesson.qs[0].q='Na regra .destaque { color: green; }, quais elementos terão o texto verde?';
 lesson.qs[0].why='O seletor começa com ponto: .destaque escolhe os elementos com class="destaque". color: green muda a cor do texto deles para verde. O seletor #destaque, com #, é que escolheria um id.';
 lesson.qs[0].h='Veja o primeiro símbolo do seletor. Na tabela acima, ponto significa classe.';
 lesson.qs[1].why='Padding é o espaço interno: fica entre o conteúdo e a borda. Margin fica depois da borda, do lado de fora. Color muda somente a cor do texto.';
 lesson.qs[1].h='No desenho, qual nome aparece entre a borda verde e o conteúdo?';
 STEPS['web-css']=[
  {intro:selectors,errors:['','id é selecionado com #. A regra usa ponto (.destaque), que seleciona a classe destaque. Veja a diferença na tabela acima.','Para escolher todos os parágrafos, o seletor seria p. Aqui o ponto em .destaque limita a regra aos elementos com essa classe.']},
  {intro:spacing,errors:['','Margin cria espaço fora da borda. A pergunta pede espaço dentro: entre a borda e o conteúdo, usamos padding.','Color altera a cor do texto, não o espaço. Para afastar o conteúdo da borda pelo lado interno, usamos padding.']}
 ];
 lesson.body=selectors+spacing;
})();
