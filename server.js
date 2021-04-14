const express=require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Pusher = require('pusher');
const path = require('path');

//app config
const app=express();
const port=process.env.PORT||8000;

const pusher = new Pusher({
  appId: "1186739",
  key: "cccdc78c6de2ce551133",
  secret: "9e8a65cfe32f6eca31d6",
  cluster: "ap2",
  useTLS: true
});


// middlewares
app.use(express.json());
app.use(cors());


// db config
const connection_url="mongodb+srv://admin:CL0r3tzdsRkSKcLR@cluster0.kmjwo.mongodb.net/instaDB?retryWrites=true&w=majority"
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open',()=>{
    console.log('db connected');

    const changeStream = mongoose.connection.collection('posts').watch()

    changeStream.on('change',(change) => {
        console.log('change triggered')
        console.log(change.operationType);
        console.log('end of change')
        
        if(change.operationType== 'insert'){
            console.log('triggerein pusher img upload')
            const postDetails = change.fullDocument;
            pusher.trigger('posts','inserted',{
                user: postDetails.caption,
                caption: postDetails.caption,
                image: postDetails.image
            });
        }
        else if(change.operationType== 'update'){
            console.log('triggerein pusher img upload')
            // const postDetails = change.fullDocument;
            pusher.trigger('posts','updated',{
                // comments:[postDetails.comments]
            });
        }
        else{
            console.log('unkown pusher')
        }
    })

})

const comment=mongoose.Schema({
    user: String,
    comment: String
})

const post = mongoose.Schema({
    caption: String,
    user: String,
    image:String,
    comments: [comment]
});
const dbModel=mongoose.model('posts',post);



// const Comment=mongoose.model('comments',comment);

// api routes
app.get('/api/',(req,res) => res.status(200).send("hello world"));

app.post('/api/upload',(req,res) => {
    const body=req.body;
    dbModel.create(body,(err,data) => {
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data)
        }
    })

});

app.get('/api/sync',(req,res)=>{
    dbModel.find((err,data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data)
        }
    })
});

app.post('/api/comment',((req,res) => {
    const body=req.body;
    dbModel.findById(req.body.post_id,(err,data) => {
        if(err){
            res.status(500).send(err);
            console.log(err)
        }else{
            res.status(201).send(data);
            data.comments.push(req.body);
            data.save();
        }
    });
}));

app.get('/api/syncComment',(req,res)=>{
    dbModel.findById(req.query.post_id,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data.comments);
            console.log(data.comments)
        }
    });
});


if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build/'));
    app.get('*',(req,res) => {
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

// listen
app.listen(port,() => console.log('listening to port'));
