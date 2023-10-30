    const router = require('express').Router()
    let connectDB = require('../database')
    const {ObjectId} = require("mongodb");



    let db;
    connectDB.then((client)=>{
        console.log('DB연결성공')
        db = client.db('forum')
    }).catch((err)=>{
        console.log(err)
    })
    router.delete('/delete', async (req,res)=>{
        console.log(req.query)

        await db.collection('post').deleteOne(
            {_id : new ObjectId(req.query.docid)})
        res.send('삭제됐음')

    })

    module.exports = router