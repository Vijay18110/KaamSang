import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendTwilioSms,deliverBookingSms} from '../src/sms.js';

test('SMS configuration and provider status are reported without claiming delivery',async()=>{
 assert.equal((await sendTwilioSms({to:'+919999999999',body:'test',env:{}})).status,'not_configured');
 let received;
 const env={SMS_TWILIO_ACCOUNT_SID:'AC'+'1'.repeat(32),SMS_TWILIO_AUTH_TOKEN:'test-token',SMS_TWILIO_FROM:'+12025550123'};
 const result=await sendTwilioSms({to:'+919999999999',body:'test',env,fetchImpl:async(url,options)=>{received={url,options};return {ok:true,json:async()=>({sid:'SMtest',status:'queued'})}}});
 assert.equal(result.status,'queued');assert.equal(result.providerId,'SMtest');assert.equal(received.options.body.get('To'),'+919999999999');
 assert.equal((await sendTwilioSms({to:'+919999999999',body:'test',env,fetchImpl:async()=>({ok:false})})).status,'failed');
 assert.equal((await sendTwilioSms({to:'+919999999999',body:'test',env,fetchImpl:async()=>({ok:true,json:async()=>({sid:'SMtest',status:'failed'})})})).status,'failed');
 assert.equal((await sendTwilioSms({to:'+919999999999',body:'test',env,fetchImpl:async()=>({ok:true,json:async()=>({})})})).status,'unknown');
 assert.equal((await sendTwilioSms({to:'+919999999999',body:'test',env,fetchImpl:async()=>{throw Error('timeout')}})).status,'unknown');
});

test('booking SMS is opt-in and stores only its delivery state',async()=>{
 let update,sends=0;let user={phone:'+919999999999',sms_enabled:false};
 const db={collection:name=>name==='users'?{findOne:async()=>user}:{updateOne:async(filter,change)=>{update={filter,change}}}};
 const sender=async()=>{sends++;return {status:'queued',providerId:'SMtest'}};
 assert.equal(await deliverBookingSms({db,notificationId:'n',recipientId:'u',sender}),'not_enabled');assert.equal(sends,0);
 user={...user,sms_enabled:true};assert.equal(await deliverBookingSms({db,notificationId:'n',recipientId:'u',sender}),'queued');assert.equal(sends,1);assert.equal(update.change.$set.sms_status,'queued');assert.equal(JSON.stringify(update).includes(user.phone),false);
});
