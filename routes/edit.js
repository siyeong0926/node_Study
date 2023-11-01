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

router.get("/edit/:id", async (req,res)=>{

    let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id)})

    console.log(new ObjectId(req.params.id))

    res.render("edit.ejs", {result})
})

router.put("/edit", async (req,res)=>{

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

module.exports = router
// app.put('/edit', async (req,res)=>{
//     await db.collection('post').updateOne(
//         { _id : 1 },
//         {$inc : {like : -2}})
// })