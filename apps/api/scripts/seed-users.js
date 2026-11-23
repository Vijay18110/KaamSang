import { randomBytes, scryptSync } from 'node:crypto';
import { connectDb } from '../src/db.js';

// These IDs are distinct from the 20 accounts created by seed-demo.
// Re-running this script only inserts missing demo users.
const password=process.env.DEMO_PASSWORD || 'KaamSangDemo123!';
if(password.length<8||password.length>128)throw new Error('DEMO_PASSWORD must contain 8-128 characters');
const {db,client}=await connectDb();
try {
 const operations=[];
 for(let i=21;i<=120;i++){
  const salt=randomBytes(16).toString('hex');
  const user={id:`ks-demo-user-${i}`,name:`Demo User ${String(i).padStart(3,'0')}`,email:`user${i}@demo.kaamsang.invalid`,password:salt+':'+scryptSync(password,salt,64).toString('hex'),created_at:new Date().toISOString(),is_demo:true};
  operations.push({updateOne:{filter:{id:user.id,is_demo:true},update:{$setOnInsert:user},upsert:true}});
 }
 const result=await db.collection('users').bulkWrite(operations,{ordered:true});
 const count=await db.collection('users').countDocuments({is_demo:true});
 console.log(`Demo users: ${result.upsertedCount} added, ${result.matchedCount} already present; ${count} demo users total.`);
} finally { await client.close(); }
