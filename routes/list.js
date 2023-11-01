const connectDB = require("../database");
const router = require('express').Router()

let db;
connectDB.then((client)=>{
    console.log('DB연결성공')
    db = client.db('forum')
}).catch((err)=>{
    console.log(err)
})

router.get('/list', async (요청, 응답)=>{
    let result = await db.collection('post').find().toArray() // db 에서 컬렉션에 있던 모든 document가 출력

    // ejs 파일은 sendFile 가 아닌 render(파일경로) 이렇게 작성해야함
    응답.render('list.ejs', { 글목록 : result})
    // ejs 파일은 views 폴더 안에 만들어야함
})

module.exports = router