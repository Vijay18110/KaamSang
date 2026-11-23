// The provider response indicates queueing, not delivery. No credentials are logged.
export async function sendTwilioSms({to,body,env=process.env,fetchImpl=fetch}){
 const account=env.SMS_TWILIO_ACCOUNT_SID,token=env.SMS_TWILIO_AUTH_TOKEN,from=env.SMS_TWILIO_FROM;
 if(!account||!token||!from)return {status:'not_configured'};
 if(!/^AC[0-9a-fA-F]{32}$/.test(account)||!/^\+[1-9]\d{7,14}$/.test(from))return {status:'not_configured'};
 try{
  const response=await fetchImpl(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`,{method:'POST',headers:{Authorization:'Basic '+Buffer.from(`${account}:${token}`).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({To:to,From:from,Body:body}),signal:AbortSignal.timeout(8000)});
  if(!response.ok)return {status:'failed'};
  const data=await response.json();
  if(typeof data.sid!=='string'||!data.sid)return {status:'unknown'};
  if(['failed','undelivered','canceled'].includes(data.status))return {status:'failed',providerId:data.sid};
  if(!['queued','accepted','sending'].includes(data.status))return {status:'unknown',providerId:data.sid};
  return {status:'queued',providerId:data.sid};
 }catch{return {status:'unknown'};}
}

export async function deliverBookingSms({db,notificationId,recipientId,sender=sendTwilioSms}){
 const users=db.collection('users'),notifications=db.collection('notifications');
 const user=await users.findOne({id:recipientId},{projection:{_id:0,phone:1,sms_enabled:1}});
 let result={status:'not_enabled'};
 if(user?.sms_enabled===true&&typeof user.phone==='string'&&/^\+[1-9]\d{7,14}$/.test(user.phone)){
  try{result=await sender({to:user.phone,body:'KaamSang: You have a new booking request. Open My activity in KaamSang to review it.'});}catch{result={status:'unknown'};}
 }
 const allowed=['queued','failed','unknown','not_configured','not_enabled'];
 if(!allowed.includes(result?.status))result={status:'unknown'};
 await notifications.updateOne({id:notificationId,user_id:recipientId},{$set:{sms_status:result.status,...(result.providerId?{sms_provider_id:String(result.providerId).slice(0,100)}:{})}});
 return result.status;
}
