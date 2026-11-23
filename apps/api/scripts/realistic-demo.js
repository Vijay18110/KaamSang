import { connectDb } from '../src/db.js';

// Update only the original, explicitly tagged demo records. Existing users' edits,
// applications and booking/contact history are preserved.
const firstNames=['Aarav','Priya','Rahul','Neha','Amit','Pooja','Imran','Kavita','Rohit','Anjali','Vikram','Sana','Deepak','Meera','Aditya','Nisha','Arjun','Fatima','Sandeep','Ritu','Mohit','Isha','Nitin','Ayesha','Karan','Swati','Abhishek','Simran','Manoj','Divya'];
const lastNames=['Sharma','Verma','Singh','Khan','Gupta','Yadav','Patel','Mishra','Jain','Malik','Mehta','Kumar'];
const examples=[
 {category:'Printing',skills:['Digital printing operator','Flex & banner printing','Print shop assistant','Business card printing','Offset printing support'],work:['Printing operator for a local shop','Need help with banner printing','Print shop assistant for weekend','Business card design and printing','Offset machine operator needed'],desc:'File setup, print finishing and quality checks for everyday print orders.'},
 {category:'Carpentry',skills:['Furniture repair carpenter','Modular furniture assembly','Woodwork and fittings','Door and cabinet repairs','Custom shelf installation'],work:['Carpenter for cupboard repair','Need shelves installed at home','Furniture assembly for an office','Repair a wooden door and hinges','Carpenter for small shop fittings'],desc:'Furniture assembly, minor repairs, fittings and practical woodwork.'},
 {category:'Electrical',skills:['Home electrician','Lighting and fan installation','Electrical repairs','Switchboard service','Office electrical maintenance'],work:['Electrician for fan installation','Replace switches and light fixtures','Electrical maintenance for a shop','Help with office lighting','Electrician for minor home repairs'],desc:'Lighting, switches and routine electrical maintenance work.'},
 {category:'Plumbing',skills:['Home plumbing repairs','Bathroom fittings specialist','Leak and tap repair','Water tank fitting assistance','Plumbing maintenance'],work:['Fix a leaking kitchen tap','Plumber for bathroom fittings','Need help with pipe leakage','Install a washbasin tap','Plumbing maintenance for a shop'],desc:'Tap repairs, bathroom fittings and everyday plumbing work.'},
 {category:'Cleaning',skills:['Home cleaning helper','Office cleaning support','Deep cleaning assistance','Kitchen cleaning helper','Move-in cleaning support'],work:['Home cleaning help needed','Office cleaning for a small team','Help with a move-in clean','Kitchen cleaning assistance','Cleaning helper for a weekend'],desc:'Home and workplace cleaning support with scope agreed in advance.'},
 {category:'Design & creative',skills:['Social media graphic designer','Logo and brand designer','Poster and flyer designer','Product photo editor','Presentation designer'],work:['Design social media posts','Need a flyer for a local event','Create a simple brand identity','Edit product photos for a shop','Design a business presentation'],desc:'Thoughtful digital design, layouts and visual content for small businesses.'},
 {category:'Digital & tech',skills:['Website developer','WordPress website support','Data entry specialist','Excel and reporting support','Mobile app UI developer'],work:['Build a small business website','Update a WordPress website','Help organize data in Excel','Data entry for inventory records','Frontend developer for a project'],desc:'Practical digital support for websites, data and everyday business tasks.'},
 {category:'Teaching',skills:['Maths tutor for school students','English speaking tutor','Science tutor','Computer basics trainer','Primary classes tutor'],work:['Maths tutor for class 8','English practice tutor needed','Science tutor for school student','Computer basics trainer needed','Tutor for primary school subjects'],desc:'Patient, structured learning support tailored to the student’s level.'},
 {category:'Events & support',skills:['Event setup helper','Wedding event support','Registration desk assistant','Event photography assistant','Exhibition support staff'],work:['Event helpers for venue setup','Registration desk help needed','Support staff for a local event','Helper for an exhibition stall','Event team member for a function'],desc:'Hands-on support for setup, guest coordination and event-day tasks.'},
 {category:'Retail',skills:['Shop assistant','Retail billing assistant','Inventory and stock helper','Customer service assistant','Store operations support'],work:['Shop assistant for evening shift','Retail billing assistant needed','Help organize shop inventory','Customer support at a store','Store helper for a busy weekend'],desc:'Friendly support with customers, billing, stock and daily shop work.'}
];
const jobNotes={hourly:'A short assignment; exact timing and requirements can be discussed before confirming.',daily:'Help is needed for a day shift. Please discuss the schedule and any required materials.',project:'Looking for someone to complete a defined task. Please share relevant experience and a quote.', 'part-time':'Part-time support is needed on a recurring schedule. Working hours can be discussed.','full-time':'Full-time opportunity. Experience, schedule and terms will be discussed during the application process.'};
const types=['hourly','daily','project','part-time','full-time'];
const rateTypes=['hour','day','project','month'];
const {db,client}=await connectDb();
try{
 let usersChanged=0,listingsChanged=0,postsChanged=0,skipped=0;
 for(let i=1;i<=120;i++){
  const name=firstNames[(i-1)%firstNames.length]+' '+lastNames[Math.floor((i-1)/firstNames.length)%lastNames.length];
  const result=await db.collection('users').updateOne({id:`ks-demo-user-${i}`,is_demo:true,name:/^Demo User /},{$set:{name}});
  usersChanged+=result.modifiedCount;
 }
 const [usedListingBookings,usedListingContacts,usedPostApplications,usedPostBookings]=await Promise.all([
  db.collection('bookings').distinct('listing_id',{listing_id:{$exists:true}}),
  db.collection('contacts').distinct('listing_id',{listing_id:{$exists:true}}),
  db.collection('applications').distinct('post_id',{post_id:{$exists:true}}),
  db.collection('bookings').distinct('post_id',{post_id:{$exists:true}})
 ]);
 const usedListings=new Set([...usedListingBookings,...usedListingContacts]),usedPosts=new Set([...usedPostApplications,...usedPostBookings]);
 for(let i=0;i<50;i++){
  const example=examples[i%examples.length],variation=Math.floor(i/examples.length),listingId=`ks-demo-listing-${i+1}`,postId=`ks-demo-post-${i+1}`;
  if(!usedListings.has(listingId)){
   const rateType=rateTypes[(i+variation)%rateTypes.length],rateBase={hour:250,day:1200,project:3500,month:18000}[rateType];
   const result=await db.collection('listings').updateOne({id:listingId,is_demo:true,title:/^Demo · /},{$set:{title:example.skills[variation],category:example.category,description:example.desc,rate_type:rateType,rate:rateBase+variation*(rateType==='hour'?25:rateType==='day'?100:rateType==='project'?500:1000)}});
   listingsChanged+=result.modifiedCount;
  }else skipped++;
  if(!usedPosts.has(postId)){
   const workType=types[(i+variation)%types.length],budgetBase={hourly:250,daily:1200,project:4000,'part-time':9000,'full-time':20000}[workType];
   const result=await db.collection('posts').updateOne({id:postId,is_demo:true,title:/^Demo · /},{$set:{title:example.work[variation],category:example.category,description:jobNotes[workType],work_type:workType,budget:budgetBase+variation*(workType==='hourly'?25:workType==='daily'?100:workType==='project'?500:1000)}});
   postsChanged+=result.modifiedCount;
  }else skipped++;
 }
 console.log(JSON.stringify({usersChanged,listingsChanged,postsChanged,skippedLinkedRecords:skipped}));
}finally{await client.close()}
