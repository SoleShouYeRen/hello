// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('shipin').where({_id:event.shipinid}).update({
      data: {
        comments: _.push(event.newComment)
      }
    })
  } catch (e) {
    console.error(e)
  }
}