const router = require('express').Router()


router.get('/list/:id', async (요청, 응답)=>{

    let result = await db.collection('post').find()
        .skip( (요청.params.id - 1) * 5).limit(5).toArray()
    응답.render('list.ejs', { 글목록 : result})
})

router.get('/list/next/:id', async (요청, 응답)=>{

    let result = await db.collection('post')
        .find({ _id : {$gt : new ObjectId(요청.params.id) }})
        .limit(5).toArray()
    응답.render('list.ejs', { 글목록 : result})
})

    module.exports = router