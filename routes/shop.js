

    const router = require('express').Router()




    router.get('/shirts', (요청,응답)=>{
        응답.send('셔츠파는 베이지임')
    })
    router.get('/pants', (요청,응답)=>{
        응답.send('바지파는 페이지임')
    })

    module.exports = router