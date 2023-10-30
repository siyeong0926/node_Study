

        const express = require('express')
        const app = express()

        const {MongoClient} = require('mongodb')
        const uri = "your_mongodb_connection_string"

        app.use(express.static(__dirname + '/public'))
        app.set('view engine', 'ejs')

        app.use(express.json())
        app.use(express.urlencoded({extended:true}))

        const url = process.env.DB_URL

        new MongoClient(url).connect().then((client) =>{
            console.log('DB연결 성공')

            db = client.db('teVer')
            app.listen(8080,()=>{
                console.log('http://localhost:8080 에서 서버 실행 됨')
            })
        }).catch((err) =>{
            console.log(err)
        })

        app.get('/teVer', (요청,응답)=>{
            응답.render('teVer.ejs')
        })

        app.post('/addTwo', async (요청,응답)=>{
            try {
               const data = 요청.body

                const collection = db.collection('post');
               const result = await collection.insertOne(data);
               응답.status(200).send({message : '데이터 삽입 성공'});

            }catch (error){
                console.error('데이터 삽입 실패', error);
                응답.status(500).send({message : '서버 에러임'});
            }

            console.log(요청.body)
        })