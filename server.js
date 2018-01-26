let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mongoose = require('mongoose');
let cors = require('cors');

app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

mongoose.Promise = Promise;

let dbUrl = "mongodb://admin:admin@localhost:27017/chat";

let Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        if(err)
            console.log('Messages error', err);
        res.send(messages);
    });
});

app.post('/messages', async (req, res) => {

    try {

        let message = new Message(req.body);
        let savedMessage = await message.save();
        let censored = await Message.findOne({message: 'fuck'});

        if(censored)
            await Message.remove({_id: censored.id});
        else
            io.emit('message', req.body);

        res.sendStatus(200);

    } catch (error) {

        res.sendStatus(500);
        console.error(error);

    } finally {

        console.log('joj');

    }

});


io.on('connection', (socket) => {
    console.log('user connected!');
});

mongoose.connect(dbUrl,(err) => {
    if(err)
        console.log('mongoDB', err);
    else
        console.log('mongoDB', 'OK');
});

let server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});