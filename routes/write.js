const {ObjectId} = require("mongodb");
const connectDB = require("../database");
const multer = require("multer");
const multerS3 = require("multer-s3");
const {S3Client} = require("@aws-sdk/client-s3");
const router = require('express').Router()
const s3 = new S3Client({
    region : 'ap-northeast-2',
    credentials : {
        accessKeyId : process.env.S3_KEY,
        secretAccessKey : process.env.S3_SECRET,
    }
})

let db;
connectDB.then((client)=>{
    console.log('DB연결성공 글쓰기')
    db = client.db('forum')
}).catch((err)=>{
    console.log(err)
})
// ------------------------------------------

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'hodumaruforum1',
        key: function (요청, file, cb) {
            cb(null, Date.now().toString()) //업로드시 파일명 변경가능
        }
    })
})

router.get('/write', (요청,응답)=>{
    응답.render('write.ejs')
})

router.post('/add', upload.single('img1'), async (요청,응답)=>{


    //업로드 완료시 이미지 URL 생성해줌
    //요청.file
    console.log(요청.file.location)

    //!요청.user는 요청.user가 undefined인지 아닌지를 검사하는 방법입니다.
    // 만약 요청.user가 undefined이면, !요청.user는 true가 되어 if문의 조건을 만족하게 됩니다.
    // 즉, 사용자가 로그인하지 않았다면 !요청.user는 true가 되어
    // 로그인 하십숑이라는 메시지를 보내고 함수를 종료합니다.
    // 사용자의 로그인 상태를 확인함
    if (!요청.user) {// 로그인이 되어있지 않다면
        응답.send('로그인 하십숑')
        return
    }

    try {
        let result = await db.collection('user').findOne({_id : new ObjectId(요청.user._id)})
        if (요청.body.title == ''){
            응답.send('제목 입력 안함')

        }else {

            await db.collection('post').insertOne({
                title : 요청.body.title ,
                content : 요청.body.content,
                img : 요청.file.location

            })
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

module.exports = router