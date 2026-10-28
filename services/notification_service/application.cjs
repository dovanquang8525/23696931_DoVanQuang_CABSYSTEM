'use strict';
const b=require('../../scripts/business.cjs');
const {createBus}=require('../../scripts/event-bus.cjs');
async function create({db,client,server}){
  const c=b.context('notification_service',db,client),notifications=db.collection('notifications');
  await notifications.createIndex({recipient_account_id:1,event_id:1,type:1},{unique:true});
  const bus=await createBus({service:'notification_service',db,client,async consume(event,session){
    const p=event.payload;
    const recipients=[...new Set([p.recipientAccountId,p.customerAccountId,p.driverAccountId].filter(Boolean))];
    const entity=event.eventType.split('.')[0];
    const related=p[entity+'Id'];
    for(const recipient of recipients){
      const id=new b.ObjectId();
      const row={_id:id,notification_id:await b.allocateId(db,'n',session),recipient_account_id:recipient,event_id:event.eventId,
        type:event.eventType,content:event.eventType+' — '+related,related_entity_type:entity.toUpperCase(),
        related_entity_id:related,occurred_at:event.occurredAt,created_at:b.now()};
      await notifications.updateOne({recipient_account_id:recipient,event_id:event.eventId,type:event.eventType},{$setOnInsert:row},{upsert:true,session});
    }
  }});
  b.addHandlers(server,'notification',{
    async ListMyNotifications(i,call){const {claims,aid}=await c.actor(call,['CUSTOMER','DRIVER','ADMIN']);return b.page(notifications,{recipient_account_id:claims.sub},i,row=>b.views.notification({...row,recipient_account_id:aid}));},
    async GetNotification(i,call){
      b.v.fields(i,['notification_id'],['notification_id']);const {claims,aid}=await c.actor(call,['CUSTOMER','DRIVER','ADMIN']);
      const row=await notifications.findOne({notification_id:b.v.id(i.notification_id)});
      if(!row||row.recipient_account_id!==claims.sub)b.forbidden();return b.views.notification({...row,recipient_account_id:aid});
    }
  });
  return {isReady:bus.isReady,close:bus.close};
}
module.exports={create};
