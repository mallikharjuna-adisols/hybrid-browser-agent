
const express = require('express');
const app = express();
let logs=[];
app.get('/logs',(req,res)=>res.json(logs));
app.post('/log',(req,res)=>{logs.push(req.body);res.sendStatus(200);});
app.listen(4000,()=>console.log('dashboard running'));
