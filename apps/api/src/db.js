import { MongoClient } from 'mongodb';

export async function connectDb(uri = process.env.MONGODB_URI, dbName = process.env.MONGODB_DB || 'kaamsang') {
 if (!uri) throw new Error('MONGODB_URI is required');
 const client = new MongoClient(uri);
 await client.connect();
 const db = client.db(dbName);
 try {
  await Promise.all([
   db.collection('users').createIndex({email:1},{unique:true}),
   db.collection('sessions').createIndex({token:1},{unique:true}),
   db.collection('sessions').createIndex({expires_at:1},{expireAfterSeconds:0}),
   db.collection('organization_members').createIndex({organization_id:1,user_id:1},{unique:true}),
   db.collection('organization_members').createIndex({user_id:1,status:1}),
   db.collection('organizations').createIndex({owner_id:1,created_at:-1}),
   db.collection('applications').createIndex({post_id:1,user_id:1},{unique:true}),
   db.collection('reviews').createIndex({booking_id:1,reviewer_id:1},{unique:true}),
   db.collection('blocks').createIndex({blocker_id:1,blocked_id:1},{unique:true}),
   db.collection('saved').createIndex({user_id:1,listing_id:1},{unique:true}),
   db.collection('availability').createIndex({user_id:1},{unique:true}),
   db.collection('bookings').createIndex({worker_id:1,status:1,start_at:1,end_at:1}),
   db.collection('bookings').createIndex({application_id:1},{unique:true,partialFilterExpression:{application_id:{$type:'string'}}}),
   db.collection('bookings').createIndex({post_id:1,status:1}),
   db.collection('listings').createIndex({status:1,created_at:-1,id:-1}),
   db.collection('posts').createIndex({status:1,created_at:-1,id:-1}),
   db.collection('reports').createIndex({status:1,created_at:-1,id:-1}),
   db.collection('admin_action_logs').createIndex({created_at:-1,id:-1})
  ]);
 } catch (error) { await client.close(); throw error; }
 return {db,client};
}
