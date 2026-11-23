import { randomBytes, scryptSync } from 'node:crypto';
import { connectDb } from '../src/db.js';

// Demo records are tagged and inserted only when absent. Existing data is never overwritten.
const password=process.env.DEMO_PASSWORD || 'KaamSangDemo123!';
if(password.length<8||password.length>128)throw new Error('DEMO_PASSWORD must contain 8-128 characters');
const categories=[
 ['Printing','Digital printing operator'],['Carpentry','Furniture repair'],['Electrical','Electrician'],['Plumbing','Plumber'],['Cleaning','Cleaning helper'],
 ['Design & creative','Graphic designer'],['Digital & tech','Website developer'],['Teaching','Home tutor'],['Events & support','Event helper'],['Retail','Shop assistant']
];
const cities=['Lucknow','Delhi','Mumbai','Jaipur','Pune','Bengaluru','Hyderabad','Indore','Bhopal','Kanpur'];
const rates=['hour','day','project','month'];
const workTypes=['hourly','daily','project','part-time','full-time'];
const {db,client}=await connectDb();
try{
 const users=[];
 for(let i=1;i<=20;i++){
  const salt=randomBytes(16).toString('hex');
  users.push({id:`ks-demo-user-${i}`,name:`Demo User ${String(i).padStart(2,'0')}`,email:`user${i}@demo.kaamsang.invalid`,password:salt+':'+scryptSync(password,salt,64).toString('hex'),created_at:new Date().toISOString(),is_demo:true});
 }
 const listings=[],posts=[];
 for(let i=0;i<50;i++){
  const [category,skill]=categories[i%categories.length];
  const city=cities[(i*3+Math.floor(i/10))%cities.length];
  const type=rates[i%rates.length];
  listings.push({id:`ks-demo-listing-${i+1}`,user_id:users[i%users.length].id,title:`Demo · ${skill} ${i+1}`,category,city,description:`Sample profile for ${skill.toLowerCase()} in ${city}. Demo data for exploring KaamSang; not a real service.`,rate:[250,1200,5000,15000][i%4]+Math.floor(i/10)*50,rate_type:type,status:'active',created_at:new Date(Date.now()-i*60000).toISOString(),is_demo:true});
  const workType=workTypes[i%workTypes.length];
  posts.push({id:`ks-demo-post-${i+1}`,user_id:users[(i+7)%users.length].id,title:`Demo · ${skill} needed ${i+1}`,category,city,description:`Sample ${workType} opportunity in ${city} for ${skill.toLowerCase()}. Demo data only; do not apply for real work.`,budget:[1200,2000,6000,12000,25000][i%5]+Math.floor(i/10)*100,work_type:workType,headcount:1+i%5,status:'published',created_at:new Date(Date.now()-i*60000).toISOString(),is_demo:true});
 }
 for(const [collection,docs] of [['users',users],['listings',listings],['posts',posts]]){
  const result=await db.collection(collection).bulkWrite(docs.map(document=>({updateOne:{filter:{id:document.id,is_demo:true},update:{$setOnInsert:document},upsert:true}})),{ordered:true});
  console.log(`${collection}: ${result.upsertedCount} inserted, ${result.matchedCount} already present`);
 }
 console.log('Demo marketplace: 50 skill listings + 50 work posts across 10 categories, 10 cities, 4 rate types, and 5 work types.');
 console.log('Demo sign-in: user1@demo.kaamsang.invalid / '+(process.env.DEMO_PASSWORD?'your DEMO_PASSWORD':'KaamSangDemo123!'));
}finally{await client.close()}
