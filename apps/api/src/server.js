import { createApp } from './app.js';
import { connectDb } from './db.js';
const port=Number(process.env.PORT||4000);
const {db,client}=await connectDb();
const server=createApp(db,client).listen(port,()=>console.log(`KaamSang API listening on http://localhost:${port}`));
for (const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>server.close(async()=>{await client.close();process.exit(0)}));
