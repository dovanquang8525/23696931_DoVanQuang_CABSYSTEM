'use strict';
const b=require('../../scripts/business.cjs');
async function create({db,client,server}){
  const c=b.context('rating_service',db,client),reviews=db.collection('reviews');
  await reviews.createIndex({trip_id:1},{unique:true});
  async function trip(id,call){return (await c.invoke('trip','getTripForReview',{trip_id:b.v.id(id)},call)).trip;}
  b.addHandlers(server,'rating',{
    async CreateReview(i,call){
      b.v.fields(i,['trip_id','rating','comment'],['trip_id','rating']);await c.actor(call,['CUSTOMER']);
      if(!Number.isInteger(i.rating)||i.rating<1||i.rating>5)b.v.invalid();
      const comment=i.comment===undefined?undefined:b.v.text(i.comment,500),current=await trip(i.trip_id,call);
      if(current.status!=='COMPLETED')b.conflict();
      const id=new b.ObjectId(),row={_id:id,review_id:id.toHexString(),trip_id:i.trip_id,customer_id:current.customer_id,
        driver_id:current.driver_id,rating:i.rating,...(comment?{comment}:{}),created_at:b.now()};
      await reviews.insertOne(row);return b.views.review(row);
    },
    async GetReviewByTrip(i,call){
      b.v.fields(i,['trip_id'],['trip_id']);await c.actor(call,['CUSTOMER','DRIVER','ADMIN']);await trip(i.trip_id,call);
      const row=await reviews.findOne({trip_id:i.trip_id});if(!row)b.missing();return b.views.review(row);
    }
  });
  return {isReady:()=>true,async close(){}};
}
module.exports={create};
