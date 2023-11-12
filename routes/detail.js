const {ObjectId} = require("mongodb");
const connectDB = require("../database");
const router = require('express').Router()

let db;
connectDB.then((client)=>{
    console.log('DB연결성공')
    db = client.db('forum')
}).catch((err)=>{
    console.log(err)
})

router.get("/detail/:id", async (req,res)=>{
    try {

        // MongoDB의 'post' 컬렉션에서 _id 필드가 URL 파라미터로 받은 id와 일치하는 문서를 찾습니다.
        // URL 파라미터로 받은 id는 문자열이므로, MongoDB의 ObjectId로 변환해줘야 합니다.
        let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id)})
        console.log(new ObjectId(req.params.id))

        if (result == null){
            res.status(400).send('이상한 url 입력했음')
        }

        else res.render('detail.ejs',{
            titleName : result,
            contentName : result,
            imgURL : result
        })

    }catch (e){
        console.log(e)
        res.status(400).send('이상한 url 입력함')
    }
})

module.exports = router