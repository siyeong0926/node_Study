const bcrypt = require("bcrypt");
const router = require('express').Router()
router.get('/join', async (요청,응답)=>{
    응답.render('join.ejs')
})

router.post('/join', async (요청,응답,cb)=>{

    //bcrypt 사용을 하기 위해서 작성하는 코드
    let 해시 = await bcrypt.hash(요청.body.password, 10) //숫자10은 얼마나 꼬아줄 것인지 15도 가능함

    //findOne 함수는 몽고DB 콜렉션에서 주어진 조건에 맞는 첫 번째 문서를 찾아 반환하는데
    // 만약 조건에 맞는 문서가 없으면 null을 반환한다.

    //요청.body에서 받은 username 과 일치하는 username 을 가진 문서를 user 콜렉션에서 찾아라
    let result = await db.collection('user').findOne({username : 요청.body.username});


    // console.log(요청)
    // console.log(응답) 이거 두 개 출력하면 뭐가 엄청 많이 출력됨

    try {

        if (요청.body.username == ''){
            응답.send('아이디 입력 안함')

        }else if (요청.body.password == '') {
            응답.send('비번 입력 안함')

            //이 조건문은 찾은 문서가 null이 아니라면, 즉 조건에 맞는 문서가 존재한다면 이라는 의미가 된다
            //결국 조건문에 따라 아이디가 중복된 내용을 체크하고 아이디 중복됨을 출력한다.
        }else if (result !== null) {
            응답.send('아이디 중복됨')
            console.log(result)

        }else if (요청.body.password !== 요청.body.passwordTwo){
            console.log(요청.body.password)
            console.log(요청.body.passwordTwo)
            응답.send('비밀번호가 같지 않다')
        }

        else {
            await db.collection('user')
                .insertOne({
                    username : 요청.body.username
                    , password : 해시})

            console.log(해시)
            응답.redirect('/')
        }

    }catch (error){
        console.error('회원가입에 실패하였습니다', error);
        응답.status(500).send({ message : '서버 에러'});
    }

})

module.exports = router