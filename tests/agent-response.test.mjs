import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/agent.mjs';

test('Agent handles output exhaustion, empty answers and conversation metadata', async () => {
 const oldFetch=globalThis.fetch;
 const keys=['AGENT_API_KEY','AGENT_BASE_URL','AGENT_MODEL'];const previous=keys.map(k=>process.env[k]);
 keys.forEach((k,i)=>process.env[k]=['test','https://example.test/v1','test-model'][i]);
 const invoke=async(messages)=>{let status,body;await handler({method:'POST',body:{messages,context:{rows:[]}}},{status(v){status=v;return this},json(v){body=v;return this}});return {status,body}};
 try {
  let requests=[];globalThis.fetch=async(_,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({choices:[{finish_reason:requests.length===1?'length':'stop',message:{content:requests.length===1?'':'Grounded answer'}}]})}};
  let result=await invoke([{role:'user',content:'Why?',ranking:[{id:'not part of chat'}]}]);
  assert.equal(result.status,200);assert.equal(result.body.answer,'Grounded answer');assert.deepEqual(requests.map(r=>r.max_tokens),[4096,8192]);assert.deepEqual(requests[0].messages.at(-1),{role:'user',content:'Why?'});
  globalThis.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:''}}]})});result=await invoke([{role:'user',content:'Why?'}]);assert.equal(result.status,502);assert.match(result.body.error,/no answer text/);
  globalThis.fetch=async(_,options)=>{const r=JSON.parse(options.body);assert.ok(JSON.stringify(r.messages.slice(1)).length<=30000);assert.equal(r.messages.at(-1).content,'Latest question');return {ok:true,json:async()=>({choices:[{message:{content:'Answer'}}]})}};
  result=await invoke([...Array.from({length:8},(_,i)=>({role:i%2?'assistant':'user',content:'x'.repeat(9000)})),{role:'user',content:'Latest question'}]);assert.equal(result.status,200);
 }finally{globalThis.fetch=oldFetch;keys.forEach((k,i)=>{if(previous[i]===undefined)delete process.env[k];else process.env[k]=previous[i]})}
});
