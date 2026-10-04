import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/agent.mjs';

test('Agent rejects empty provider content instead of reporting a successful answer', async () => {
 const oldFetch=globalThis.fetch;
 const keys=['AGENT_API_KEY','AGENT_BASE_URL','AGENT_MODEL'];
 const previous=keys.map(k=>process.env[k]);
 keys.forEach((k,i)=>process.env[k]=['test-key','https://example.test/v1','test-model'][i]);
 try {
  for(const content of ['', '   ', null, 'An evidence-based explanation']) {
   globalThis.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content}}]})});
   let status,body;const res={status(v){status=v;return this},json(v){body=v;return this}};
   await handler({method:'POST',body:{messages:[{role:'user',content:'Why?'}],context:{}}},res);
   assert.equal(status,content?.trim()?200:502);
   if(status===200)assert.equal(body.answer,content);else assert.match(body.error,/no answer text/);
  }
 } finally {
  globalThis.fetch=oldFetch;keys.forEach((k,i)=>{if(previous[i]===undefined)delete process.env[k];else process.env[k]=previous[i]});
 }
});
