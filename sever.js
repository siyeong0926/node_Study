

            // express 라이브러리를 사용하겠다는 두 줄

            //Express 라이브러리 불러오기
        const express = require('express')
            //Express 앱 인스턴스를 생성
        const app = express()

            //몽고디비 라이브러리에서 몽고디비 클라이언트를 불러오기
            const {MongoClient} = require('mongodb')
            //몽고디비 연결 문자열 설정
            const uri = "your_mongodb_connection_string";
            //몽고클라이언트 인스턴스를 생성하고, 연결 옵션을 설정함
            const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


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

                                    //몽고DB 연결 링크 및 아이디 비밀번호 작성
            const url = 'mongodb+srv://keroin100:rla334@cluster0.tu6tvsy.mongodb.net/?retryWrites=true&w=majority'
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
                db.collection('post').insertOne({title : '어쩌구'}) //DB 에 값 넣기
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

            app.post('/add', (요청,응답)=>{
                console.log(요청.body)

                //HTML 요청의 본문에 포함된 데이터에 접근하는데 사용됨
                //요청.body
            })