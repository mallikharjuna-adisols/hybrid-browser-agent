
const express = require('express');
const { addJob } = require('../orchestrator/jobRunner');
const app = express();
app.use(express.json());

app.post('/tool/run-flow', (req,res)=>{
  addJob(req.body);
  res.json({status:'queued'});
});

app.listen(3001,()=>console.log('MCP running'));
