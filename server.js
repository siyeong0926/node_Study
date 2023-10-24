

            // express 라이브러리를 사용하겠다는 두 줄

            //Express 라이브러리 불러오기
        const express = require('express')
            //Express 앱 인스턴스를 생성
        const app = express()

            //몽고디비 라이브러리에서 몽고디비 클라이언트를 불러오기
            const {MongoClient, ObjectId} = require('mongodb')
            //몽고디비 연결 문자열 설정
            const uri = "your_mongodb_connection_string";

            // method-override 라이브러리를 불러옵니다.
            // 이 라이브러리는 HTML 폼에서 PUT, DELETE와 같은 HTTP 메소드를 사용할 수 있게 해줍니다.
            const methodOverride = require('method-override');

            // method-override를 사용하여 '_method'라는 쿼리 문자열로 전달된 HTTP 메소드를 인식할 수 있도록 합니다.
            // 예를 들어, POST 요청에 '_method=DELETE'라는 쿼리 문자열이 있으면, 이를 DELETE 요청으로 인식합니다.
            app.use(methodOverride('_method'));

            //public 디렉토리 파일들을 호스팅 하도록 익스프레스에 지시함
            app.use(express.static(__dirname + '/public'))
            //app.use(express.static(__dirname + '/public2')) 다른 폴더 등록 하고 싶을 때
            //__dirname: 이는 현재 실행 중인 스크립트의 디렉토리 이름을 담고 있는 Node.js 전역 변수입니다.

            // ejs 세팅 방법 (터미널에 npm install ejs 로 설치 후에 사용)
            app.set('view engine', 'ejs')


            //밑에 두 줄은 요청.body를 통해 접근 할 수 있음
            // 요청.body 쓰려면 꼭 두 줄을 작성 해야함

            //JSON 데이터에 파싱을 위한 미들웨어 추가
            app.use(express.json())
            //URL-encoded 데이터 파싱을 위한 미들웨어 추가
            app.use(express.urlencoded({extended:true}))
            //--------------------------------------------------------------------------------------------------
                        //passport 라이브러리 세팅


            const session = require('express-session')
            const passport = require('passport')
            const LocalStrategy = require('passport-local')

            // app.use 순서 틀리면 이상해질 수 있으니 주의
            app.use(passport.initialize())
            app.use(session({

                secret: '암호화에 쓸 비번',  // 세션 문자열 암호화에 사용(길면 좋음) 털리면 인생 끝남
                resave : false, //유저가 서버로 요청을 할 때마다 session 데이터 다시 갱신할지 여부 (false 추천)
                saveUninitialized : false //유저가 로그인 안해도 세션을 만들것인지 여부 (false 추천)
            }))

            app.use(passport.session())


            //--------------------------------------------------------------------------------------------------
                        //아래는 몽고디비를 연결하는 코드들이다.

                                    //몽고DB 연결 링크 및 아이디 비밀번호 작성
            const url = 'y'
                //connect 가 몽고디비에 접속을 해줌
            new MongoClient(url).connect().then((client)=>{
                // 그 접속이 성공 하면 연결성공 출력
                console.log('DB연결성공')
                // forum 이름으로 만든 데이터베이스 프로젝트에 연결함
                db = client.db('forum')
                //위에서 DB 연결을 하고 그 이후에 서버를 띄우야 하기 때문에 여기에 배치
                app.listen(8080, () => {
                    console.log('http://localhost:8080 에서 서버 실행 중')
                })
            }).catch((err)=>{
                console.log(err)
            })

            //--------------------------------------------------------------------------------------------------

            app.get('/', (요청, 응답) => {
                응답.sendFile(__dirname + '/index.html')
            })

            app.get('/news', (요청, 응답)=> {
                db.collection('post').insertOne({title : '어쩌구'}) //DB 에 값 넣기 : insertOne
                // 응답.send('오늘 비옴')
            })

            app.get('/about', (요청,응답) =>{
                응답.sendFile(__dirname + '/about.html')
            })

            // await 을 쓰기 위해서는 함수 부분에 async 를 써야한다
            app.get('/list', async (요청, 응답)=>{
                let result = await db.collection('post').find().toArray() // db 에서 컬렉션에 있던 모든 document가 출력

                // ejs 파일은 sendFile 가 아닌 render(파일경로) 이렇게 작성해야함
                응답.render('list.ejs', { 글목록 : result})
                // ejs 파일은 views 폴더 안에 만들어야함
            })

            app.get('/time', (요청, 응답) =>{
                let data = 응답.render('time.ejs', { date : new Date()})
            })

            app.get('/write', (요청,응답)=>{
                응답.render('write.ejs')
            })

            app.post('/add', async (요청,응답)=>{
                try {

                    if (요청.body.title == ''){
                        응답.send('제목 입력 안함')

                    }else {
                        await db.collection('post').insertOne({title : 요청.body.title , content : 요청.body.content})
                        응답.redirect('/list')
                    }

                }catch (error){
                    console.error('데이터 삽입에 실패하였습니다', error);
                    응답.status(500).send({ message : '서버 에러'});
                }

                //console.log(요청.body)
                //HTML 요청의 본문에 포함된 데이터에 접근하는데 사용됨
                //유저가 input 에 입력한 글들이 담겨있음
                //요청.body
            })


            app.get("/detail/:id", async (req,res)=>{
                try {
                    let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id)})
                    console.log(new ObjectId(req.params.id))

                    if (result == null){
                        res.status(400).send('이상한 url 입력했음')
                    }

                    res.render('detail.ejs',{titleName : result})

                }catch (e){
                    console.log(e)
                        res.status(400).send('이상한 url 입력함')
                }
            })
            app.get("/edit/:id", async (req,res)=>{

                let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id)})

                console.log(new ObjectId(req.params.id))

                res.render("edit.ejs", {result})
            })

            app.put("/edit", async (req,res)=>{

                try {
                    let result = await db.collection('post').updateOne(
                        {_id : new ObjectId(req.body.id )},
                        {$set : { title : req.body.title, content : req.body.content }})

                    console.log(req.body)
                    res.redirect('/list')

                    if (result == null){
                        res.status(400).send('문제있는 url')
                    }
                }catch (e){
                    console.log(e)
                    res.status(400).send('문제되는 URL임')

                }

            });
            // app.put('/edit', async (req,res)=>{
            //     await db.collection('post').updateOne(
            //         { _id : 1 },
            //         {$inc : {like : -2}})
            // })


            app.delete('/delete', async (req,res)=>{
                console.log(req.query)

                await db.collection('post').deleteOne(
                    {_id : new ObjectId(req.query.docid)})
                res.send('삭제됐음')

            })


            // 페이지의 게시글을 5개씩 나눠서 보여주는 api
            app.get('/list/:id', async (요청, 응답)=>{

                let result = await db.collection('post').find()
                    .skip( (요청.params.id - 1) * 5).limit(5).toArray()
                응답.render('list.ejs', { 글목록 : result})
            })

            app.get('/list/next/:id', async (요청, 응답)=>{

                let result = await db.collection('post')
                    .find({ _id : {$gt : new ObjectId(요청.params.id) }})
                    .limit(5).toArray()
                응답.render('list.ejs', { 글목록 : result})
            })


