/* Original, self-contained first chapter. No network or lesson-progress mutations. */
const AuroraEngine=(()=>{
 const WIDTH=9,HEIGHT=7,targets=[3,6,13];
 const objects={power:{x:2,y:1},console:{x:5,y:4},bridge:{x:6,y:1},exit:{x:7,y:1}};
 const maps=['#########','#...#...#','#...#...#','#.......#','#...#...#','#...#...#','#########'];
 const dirs=[{x:0,y:-1,name:'norte',arrow:'↑'},{x:1,y:0,name:'leste',arrow:'→'},{x:0,y:1,name:'sul',arrow:'↓'},{x:-1,y:0,name:'oeste',arrow:'←'}];
 function floor(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<WIDTH&&y>=0&&y<HEIGHT&&maps[y][x]!=='#'&&!(x===6&&y===3)}
 function fresh(){return {version:1,player:{x:2,y:4},powerStage:0,robotStage:0,rule:'OR',bridgeOpen:false,won:false,completed:false,introSeen:false,program:[]}}
 function sanitize(raw){
  const s=fresh();if(!raw||raw.version!==1)return s;
  s.powerStage=Number.isInteger(raw.powerStage)?Math.max(0,Math.min(3,raw.powerStage)):0;
  s.robotStage=s.powerStage===3&&Number.isInteger(raw.robotStage)?Math.max(0,Math.min(2,raw.robotStage)):0;
  s.rule=raw.rule==='AND'?'AND':'OR';s.bridgeOpen=s.robotStage===2&&raw.bridgeOpen===true;s.won=s.bridgeOpen&&raw.won===true;s.completed=raw.completed===true||s.won;s.introSeen=raw.introSeen===true;
  const p=raw.player;if(p&&floor(p.x,p.y)&&!(p.x>=4&&s.powerStage<3)&&!(p.x===7&&p.y===1&&!s.bridgeOpen))s.player={x:p.x,y:p.y};
  if(Array.isArray(raw.program))s.program=raw.program.filter(c=>['F','L','R','F2','F3','F4','F5'].includes(c)).slice(0,10);
  return s;
 }
 function blocked(s,x,y){if(!floor(x,y))return 'wall';if(x===4&&y===3&&s.powerStage<3)return 'power';if(x===7&&y===1&&!s.bridgeOpen)return 'bridge';return null}
 function move(s,dir){
  const d=dirs[dir];if(!d||s.won)return {moved:false};const p={x:s.player.x+d.x,y:s.player.y+d.y},reason=blocked(s,p.x,p.y);
  if(reason)return {moved:false,reason,tile:p};s.player=p;if(p.x===7&&p.y===1){s.won=true;s.completed=true}return {moved:true,won:s.won};
 }
 function nearby(s){return Object.entries(objects).filter(([,p])=>Math.abs(p.x-s.player.x)+Math.abs(p.y-s.player.y)<=1).map(([id])=>id)}
 function checkPower(s,value){
  const target=targets[s.powerStage];if(target===undefined)return {ok:true,complete:true};
  if(!Number.isInteger(value)||value<0||value>2**(s.powerStage+2)-1)return {ok:false,message:'Use os interruptores deste painel.'};
  if(value!==target)return {ok:false,target,value,difference:target-value};s.powerStage++;return {ok:true,complete:s.powerStage===3};
 }
 function robotMission(s){return s.robotStage===0?{start:{x:5,y:5,dir:1},goal:{x:7,y:2},limit:10}:{start:{x:7,y:2,dir:3},goal:{x:5,y:2},limit:1}}
 function evaluateRobot(s,program){
  const m=robotMission(s),frames=[];let bot={...m.start};
  if(s.powerStage<3)return {ok:false,reason:'locked',frames,bot};
  if(!Array.isArray(program)||!program.length)return {ok:false,reason:'empty',frames,bot};
  if(program.length>m.limit)return {ok:false,reason:'limit',limit:m.limit,frames,bot};
  for(let index=0;index<program.length;index++){
   const command=program[index];if(!['F','L','R','F2','F3','F4','F5'].includes(command))return {ok:false,reason:'command',index,frames,bot};
   if(command==='L'||command==='R'){bot={...bot,dir:(bot.dir+(command==='L'?3:1))%4};frames.push({...bot,index,command});continue}
   const times=command==='F'?1:Number(command[1]);
   for(let repeat=0;repeat<times;repeat++){
    const d=dirs[bot.dir],x=bot.x+d.x,y=bot.y+d.y,reason=blocked(s,x,y);
    if(reason)return {ok:false,reason:'collision',obstacle:reason,index,frames,bot,tile:{x,y}};
    bot={...bot,x,y};frames.push({...bot,index,command,repeat:repeat+1,times});
   }
  }
  return {ok:bot.x===m.goal.x&&bot.y===m.goal.y,reason:'position',frames,bot,goal:m.goal};
 }
 function finishRobot(s,result){if(s.powerStage!==3||!result.ok)return false;s.robotStage=Math.min(2,s.robotStage+1);s.program=[];return true}
 function evaluateRule(rule){
  const cases=[{energy:true,card:false},{energy:false,card:true},{energy:true,card:true},{energy:false,card:false}];
  return cases.map(c=>({...c,expected:c.energy&&c.card,actual:rule==='AND'?c.energy&&c.card:c.energy||c.card}));
 }
 function checkBridge(s){if(s.robotStage<2)return {ok:false,reason:'locked'};const cases=evaluateRule(s.rule);const failed=cases.find(c=>c.expected!==c.actual);if(failed)return {ok:false,cases,failed};s.bridgeOpen=true;return {ok:true,cases}}
 return {WIDTH,HEIGHT,targets,objects,maps,dirs,floor,fresh,sanitize,blocked,move,nearby,checkPower,robotMission,evaluateRobot,finishRobot,evaluateRule,checkBridge};
})();
