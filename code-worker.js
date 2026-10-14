// Each execution gets a new worker and a fresh in-memory environment.
const normalize=value=>String(value).replace(/\r/g,'').trim();
const show=value=>typeof value==='string'?value:JSON.stringify(value);
self.onmessage=async({data:{task,code,inputs}})=>{
 let output='',result={ok:false,output:'',message:''};
 try {
  if(task.lang==='python'){
   importScripts('skulpt.min.js','skulpt-stdlib.js');
   const run=async(probe='')=>{
    let buffer='',queue=String(inputs||'').split('\n');
    Sk.configure({__future__:Sk.python3,execLimit:2000,yieldLimit:50,
     output:s=>{buffer+=s;if(buffer.length>20000)throw Error('Saída muito longa. Verifique seu laço.');},
     inputfun:()=>{if(!queue.length)throw Error('Faltou uma entrada. Preencha uma linha por input().');return queue.shift();},inputfunTakesPrompt:true,
     read:path=>{if(Object.hasOwn(task.files||{},path))return task.files[path];if(Sk.builtinFiles.files[path]!==undefined)return Sk.builtinFiles.files[path];throw Error('Arquivo ou módulo indisponível: '+path);}
    });
    await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody('<stdin>',false,code+(probe?'\nprint("__PASSO_TEST__")\n'+probe:''),true));
    return buffer;
   };
   output=await run();
   if(/mostre/i.test(task.prompt)&&!normalize(output))throw Error('Use print para mostrar o resultado na saída.');
   for(const test of task.tests){
    const text=test.probe?await run(test.probe):output;
    const actual=test.probe?text.slice(text.lastIndexOf('__PASSO_TEST__')+'__PASSO_TEST__'.length):text;
    if(normalize(actual)!==normalize(test.expect))throw Error('No teste '+(test.probe||'da saída')+', esperávamos:\n'+test.expect+'\nSeu código produziu:\n'+(normalize(actual)||'(vazio)')+'\nDica: '+task.hint);
   }
  }else if(task.lang==='sql'){
   importScripts('sql-asm.js');
   const SQL=await initSqlJs();
   for(const test of task.tests){
    const db=new SQL.Database();
    try{
     db.run('PRAGMA foreign_keys = ON;');if(test.setup)db.run(test.setup);
     const rows=db.exec(code);output=rows.length?rows.map(r=>[r.columns.join(' | '),...r.values.map(v=>v.map(x=>x===null?'NULL':x).join(' | '))].join('\n')).join('\n\n'):'Comandos executados.';
     const checks=test.probe?db.exec(test.probe):rows;
     const actual=checks.at(-1)?.values||[];
     // SQLite type names are case insensitive.
     const normalized=JSON.stringify(actual).toLowerCase(),expected=JSON.stringify(test.expect).toLowerCase();
     if(normalized!==expected)throw Error('O banco ainda não ficou como pedido.\nEsperado: '+JSON.stringify(test.expect)+'\nObtido: '+JSON.stringify(actual)+'\nDica: '+task.hint);
     if(test.reject){let rejected=false;db.run('SAVEPOINT verificar;');try{db.run(test.reject)}catch{rejected=true}finally{db.run('ROLLBACK TO verificar; RELEASE verificar;')};if(!rejected)throw Error('A restrição não impediu um valor inválido. '+task.hint);}
     if(test.probe&&checks.length)output+='\n\nVerificação:\n'+checks.at(-1).columns.join(' | ')+'\n'+actual.map(r=>r.map(v=>v===null?'NULL':v).join(' | ')).join('\n');
    }finally{db.close()}
   }
  }else if(task.lang==='javascript'){
   const logs=[];
   const print=(...args)=>{logs.push(args.map(show).join(' '));if(logs.join('\n').length>20000)throw Error('Saída muito longa.');};
   for(const test of task.tests){
    const actual=new Function('console','"use strict";\n'+code+'\nreturn ('+test.probe+');')({log:print});
    if(JSON.stringify(actual)!==JSON.stringify(test.expect))throw Error('Teste: '+test.probe+'\nEsperado: '+show(test.expect)+'\nObtido: '+show(actual)+'\nDica: '+task.hint);
   }
   output=logs.join('\n')||'Código executado. Verificações concluídas.';
  }
  result={ok:true,output,message:'Seu código passou nas verificações deste desafio.'};
 }catch(error){
  const raw=error.toString(),line=error.traceback?.[0]?.lineno;
  let guidance=/IndentationError|indent|bad input/i.test(raw)?'Confira os dois-pontos e o recuo de quatro espaços dentro de blocos.':/NameError|not defined/i.test(raw)?'Confira o nome da variável e se ela foi criada antes de ser usada.':/SyntaxError|syntax error|Unexpected/i.test(raw)?'Confira aspas, parênteses, operadores e a sintaxe da instrução.':/TimeLimit|exceeded|too much/i.test(raw)?'A execução demorou demais. Confira a condição e a atualização do seu laço.':'';
  result={ok:false,output,message:(line?'Linha '+line+': ':'')+raw+(guidance?'\n'+guidance:'')};
 }
 self.postMessage(result);
};
