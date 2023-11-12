const connectDB = require("../database");
const router = require('express').Router()

let db;
connectDB.then((client)=>{
    console.log('DB연결성공')
    db = client.db('forum')
}).catch((err)=>{
    console.log(err)
})
//------------------------------------------------------
router.get('/search', async (요청,응답)=>{
    console.log(요청.query.val)

    //정규식 : 문자를 검사하는 식
    let result = await db.collection('post')
        .find({title : {$regex : 요청.query.val}}).toArray()
    //$regex 는 특정 문자를 포함하는


    응답.render('search.ejs', { 글목록 : result})
})

module.exports = router