import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {randomUUID} from 'node:crypto';
import {createApp} from '../src/app.js';
import {connectDb} from '../src/db.js';

test('worker search uses schedule, prioritizes available people and respects phone privacy', {skip: !process.env.MONGODB_TEST_URI && 'Set MONGODB_TEST_URI to a MongoDB replica set'}, async t=>{
 const {db,client}=await connectDb(process.env.MONGODB_TEST_URI,'kaamsang_test_'+randomUUID().replaceAll('-',''));
 t.after(async()=>{await db.dropDatabase();await client.close()});
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 if(parts.hour==='23'&&parts.minute==='59'){t.skip('Test schedule excludes the final minute of the day');return}
 const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday);
 await db.collection('users').insertMany([{id:'a',email:'a@example.com',name:'Available',phone:'+919999999999',phone_public:true},{id:'b',email:'b@example.com',name:'Outside',phone:'+918888888888',phone_public:false},{id:'c',email:'c@example.com',name:'Unknown'}]);
 await db.collection('availability').insertMany([{user_id:'a',slots:[{day,start:'00:00',end:'23:59'}]},{user_id:'b',slots:[{day:(day+1)%7,start:'00:00',end:'23:59'}]}]);
 await db.collection('listings').insertMany(['a','b','c'].map((id,i)=>({id,user_id:id,title:'Gas cylinder delivery',category:'Delivery',description:'Local delivery',city:'Pune',rate_type:'day',status:'active',created_at:String(i)})));
 const app=createApp(db,client);const result=await request(app).get('/api/v1/listings').query({q:'gas cylinder booking'});
 assert.equal(result.status,200);assert.equal(result.body.data.length,3);assert.equal(result.body.data[0].id,'a');
 assert.equal(result.body.data.find(x=>x.id==='a').availability_status,'available_now');assert.equal(result.body.data.find(x=>x.id==='b').availability_status,'outside_schedule');assert.equal(result.body.data.find(x=>x.id==='c').availability_status,'schedule_not_set');
 assert.equal(result.body.data.find(x=>x.id==='a').contact_phone,'+919999999999');assert.equal(result.body.data.find(x=>x.id==='b').contact_phone,undefined);
 const filtered=await request(app).get('/api/v1/listings?availableNow=true');assert.equal(filtered.body.pagination.total,1);assert.equal(filtered.body.data[0].id,'a');
 assert.equal((await request(app).get('/api/v1/listings?availableNow=invalid')).status,400);
});

