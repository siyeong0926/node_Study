

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

            //bcrypt 세팅
            const bcrypt = require('bcrypt')

            //세션데이터를 DB에 저장하는 라이브러리 세팅
            const MongoStore = require('connect-mongo')

            //환경 변수를 보관 할 수 있게 하는 뭐 그런 세팅
            require('dotenv').config()

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
            const {data} = require("express-session/session/cookie");

            // app.use 순서 틀리면 이상해질 수 있으니 주의
            app.use(passport.initialize())
            app.use(session({

                secret: '암호화에 쓸 비번',  // 세션 문자열 암호화에 사용(길면 좋음) 털리면 인생 끝남
                resave : false, //유저가 서버로 요청을 할 때마다 session 데이터 다시 갱신할지 여부 (false 추천)
                saveUninitialized : false, //유저가 로그인 안해도 세션을 만들것인지 여부 (false 추천)
                //cookie : {maxAge : 60 * 60 * 1000} // 세션 유효기간을 변경 할 수 있음
                store : MongoStore.create({ //세션 데이터 DB에 저장을 위한 라이브러리 세팅
                                    //내 몽고디비 접속용 URL
                    mongoUrl : process.env.DB_URL
                                    //database 이름
                    ,dbName : 'forum'
                })
            }))

            app.use(passport.session())

            //--------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------
                            //aws s3 관련 multer 라이브러리 세팅

            const { S3Client } = require('@aws-sdk/client-s3')
            const multer = require('multer')
            const multerS3 = require('multer-s3')
            const s3 = new S3Client({
                region : 'ap-northeast-2',
                credentials : {
                    accessKeyId : process.env.S3_KEY,
                    secretAccessKey : process.env.S3_SECRET,
                }
            })

            const upload = multer({
                storage: multerS3({
                    s3: s3,
                    bucket: 'hodumaruforum1',
                    key: function (요청, file, cb) {
                        cb(null, Date.now().toString()) //업로드시 파일명 변경가능
                    }
                })
            })

            //--------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------
                        //아래는 몽고디비를 연결하는 코드들이다.

                                    //몽고DB 연결 링크 및 아이디 비밀번호 작성


            let connectDB = require('./database.js')
            const {router} = require("express/lib/application");

            let db;
            connectDB.then((client)=>{

                // 그 접속이 성공 하면 연결성공 출력
                console.log('DB연결성공')
                // forum 이름으로 만든 데이터베이스 프로젝트에 연결함
                db = client.db('forum')
                //위에서 DB 연결을 하고 그 이후에 서버를 띄우야 하기 때문에 여기에 배치
                app.listen(process.env.PORT, () => {
                    console.log('http://localhost:8080 에서 서버 실행 중')
                })
            }).catch((err)=>{
                console.log(err)
            })

            //--------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------


            //제출한 아이디, 비번을 DB와 비교하는 로직 코드
            passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
                console.log(입력한아이디)
                console.log(입력한비번)
                console.log(cb)

                let result = await db.collection('user').findOne({ username : 입력한아이디})

                if (!result) {
                    return cb(null, false, { message: '아이디 DB에 없음' })
                }

                //비밀번호를 비교 할 때 해싱이 되어서 저장이 됐기 때문에
                //bcrypt.compare 를 사용해서 입력한 비번을 비교해서 같으면 true 같은 걸 뱉어준다.
                // 때문에 조건식에 이렇게 담아주는 것
                if (await bcrypt.compare(입력한비번, result.password)) {

                    return cb(null, result)
                } else {
                    return cb(null, false, { message: '비번불일치' });
                }
            }))

            //--------------------------------------------------------------------------------------------------

            ///로그인시 세션 만들기 (로그인 유지)
            passport.serializeUser((user, done) =>{// 요청.login() 쓰면 자동 실행됨
                console.log(user)
                console.log(done)

                process.nextTick(() =>{ //내부 코드를 비동기적으로 실행시켜줌

                    // 여기 내용을 세션 document 메모리에 발행해줌 (db는 다음 강의)
                    done(null,{id : user._id , username : user.username} )
                    //password는 저장 안하는 것이 좋을 듯
                })
            })

            //유저가 보낸 쿠키 분석, 즉 로그인 할 때 쿠키가 같이 전송되는데 그 쿠키를 까보고 분석하는거임
            //쿠키를 까보고 세션 데이터와 비교 후 별 이상이 없으면 현재 로그인된 유저 정보를 알려줌
            //이런 분석을 하는 기능을 갖고 있어서 아무 api에서 요청.user 라고 입력하면 로그인된 유저 정보 알려줌
            passport.deserializeUser(async (user, done)=>{
                //세션 정보를 요청.user 에 담아주는 것은 좋으나, 오래 되면 사실과 다를 수 있는 문제가 발생
                //좋은 관습은 db조회부터 해보는 것이다.

                // user 콜렉션에서 user.id 를 가져와 result 변수에 담고
                let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})

                delete result.password //비번은 민감한 정보니까 삭제하고 요청.user에 담아줌

                process.nextTick(()=>{
                    done(null, result) //result 자리에 원래 user 가 들어가는데 result 로 대체
                    //이렇게 하면 최신 유저 정보를 요청.user 에 넣을 수 있다.
                })
            })


            //--------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------

                            //미들웨어 함수를 만들자

            function checkLogin(요청,응답,next){
                if (!요청.user){
                    응답.send('로그인 하숑 !')
                }
                next()
            }

            function checkTime(요청,응답,next){
                if ('/list'){
                    console.log(new Date().toLocaleTimeString());
                }
                next()
            }

            function checkBlank(요청,응답,next){
                if (요청.body.username == '' || 요청.body.password == ''){
                    응답.send('빈칸은 안돼안돼')
                }else {
                    next();
                }
            }

            function loggedin(요청,응답,next){

                //로그인 후 세션이 있으면 요청.user 가 항상 존재함
                if (요청.user){// 로그인 상태 확인(로그인 되었다면)
                    next(); //통과
                }else {
                    응답.send('로그인 먼저 하셈')
                }
            }

            app.use('/list', checkTime)
            app.post('/login', checkBlank)

            //--------------------------------------------------------------------------------------------------
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
                //__dirname을 사용하면 파일 시스템에서의 위치에 상관없이 정확한 파일 경로를 얻을 수 있어,
                // 파일을 읽거나 쓰는 등의 작업을 할 때 유용합니다.
            })
            //--------------------------------------------------------------------------------------------------
                    // 목록

            app.get('/list', require('./routes/list'))

            //--------------------------------------------------------------------------------------------------
                        //현재시간 출력 (연습용)
            app.get('/time', (요청, 응답) =>{
                let data = 응답.render('time.ejs', { date : new Date()})
            })

            //--------------------------------------------------------------------------------------------------
                        //글쓰기
            app.get('/write', require('./routes/write'))
            app.post('/add', require('./routes/write'))

            //--------------------------------------------------------------------------------------------------
                //상세 페이지
            app.get('/detail/:id', require('./routes/detail'))

            //--------------------------------------------------------------------------------------------------
                    //수정 페이지
            app.get('/edit/:id', require('./routes/edit'))
            app.put('/edit', require('./routes/edit'))

            //--------------------------------------------------------------------------------------------------
                        // 삭제 api
            app.delete('/delete', require('./routes/delete'))


            //--------------------------------------------------------------------------------------------------
                        // 페이지의 게시글을 5개씩 나눠서 보여주는 api
            app.get('/list/:id', require('./routes/fiveList'))
            app.get('/list/next/:id', require('./routes/fiveList'))



            //--------------------------------------------------------------------------------------------------

                                //회원가입
            app.get('/join', require('./routes/join'))
            app.post('/join', require('./routes/join'))


            //--------------------------------------------------------------------------------------------------
                            //로그인

            app.get('/login' , require('./routes/login.js'))
            app.post('/login' , require('./routes/login.js'))

            //--------------------------------------------------------------------------------------------------
                        //마이페이지

            // /mypage 요청과 mypage.ejs 응답 사이에 loggedin 함수를 넣으면
            // 중간에 함수를 실행시켜준다
            app.get('/mypage', loggedin,(요청,응답)=>{
                console.log('마이페이지에 접근한 유저 정보', 요청.user) //쿠키분석 덕에 요청.user는 유저 정보를 알려줌
                응답.render('mypage.ejs', {user : 요청.user})
            })

            //--------------------------------------------------------------------------------------------------

            app.use('/shop' , require('./routes/shop.js'))


