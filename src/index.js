var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

//setting the body parser middleware for json
app.use(bodyParser.json());

//setting the body parser middleware for form
app.use(bodyParser.urlencoded({extended: true}));

//database functions
//connecting to database using promise approach
var Member;
function openDbConnection() {
    // var connectionString = 'mongodb://127.0.0.1:27017/test'
    var connectionString = 'mongodb+srv://himanshu:Himanshu728@testcluster.ox47qgk.mongodb.net/Demo?retryWrites=true&w=majority';
    mongoose.connect(connectionString).then(() => {
        console.log('connected to database');
        Member = getCollection();
    }).catch((error) => {
        console.log(error);
    });
}

//get Collection
function getCollection() {
    //creating the document schema
    var schema = new mongoose.Schema({
        empId:{
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'Engineer'
        },
        attendance:{
            type: Number,
            default: 0
        }
    });

    var Member = new mongoose.model('Member', schema);
    console.log('connected to Collection Member');
    return Member;
}

//opening the connection
openDbConnection();

//connecting to the collection
async function getAllMembers(res) {
    var result = await Member.find();
    res.send(JSON.stringify(result))
}

async function insertMember(res, data) {
    var result = await Member.insertMany([data]);
    res.send(result);
}

async function updateMember(res, data){
    var query = {empId: data.empId};
    var result = await Member.findOneAndUpdate(query, data, {upsert: true});
    res.send(result);
}

async function deleteMembers(res, data){
    var query = {empId: data.empId};
    var result;
    if(data.deleteMode === 'Many'){
        result = await Member.deleteMany(query);
    }
    else{
        result = await Member.deleteOne(query);
    }
    res.send(result);
}

async function getAttendance(res, data){
    //finding the user with empId
    var query = {empId: data.empId};
    var member = await Member.find(query);
    member = member[0];
    res.send(JSON.stringify(member.attendance));
}

async function updateAttendance(res, data){
    //finding the user
    var query = {empId: data.empId};
    var member = await Member.find(query).limit(1);
    member = member[0];
    member.attendance = member.attendance + 1;
    var result = await Member.findOneAndUpdate(query, member, {upsert: false});
    res.send(result);
}

//creating the express server
app.get('/getAllMembers', async function (req, res) {
    //getting the Members Documents
    await getAllMembers(res);
});

app.post('/getAttendance', async function (req, res){
    //getting the attendace of the member
    await getAttendance(res, req.body);
});

app.put('/updateAttendance', async function (req, res){
    //updating the attendance of the given user
    await updateAttendance(res, req.body);
});

app.post('/insertMember', async function (req, res) {
    //inserting the data to the database
    await insertMember(res, req.body);
});

app.put('/updateMember', async function (req, res){
    //updating the member
    await updateMember(res, req.body);
});

app.delete('/deleteMembers', async function (req, res){
    //deleting the members that match the query
    await deleteMembers(res, req.body);
});

app.listen(process.env.PORT || 3000, function () {
    console.log('listening at port 3000');
})