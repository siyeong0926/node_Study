    const passport = require("passport");
    const router = require('express').Router()


    router.get('/login', async (요청,응답)=>{

        응답.render('login.ejs')
    })
    router.post('/login', async (요청,응답,next)=>{

        passport.authenticate('local', (error, user, info) => {

            if (error) return 응답.status(500).json(error)
            if (!user) return 응답.status(400).json(info.message)

            요청.logIn(user, (err)=>{

                if (err) return next(err);
                응답.redirect('/'); //로그인 완료시 실행 할 코드
            })
        })(요청,응답, next);
    })

    module.exports = router