
const queue = [];
function addJob(job){ queue.push(job); }
async function runJobs(worker){
  while(queue.length){
    const job = queue.shift();
    try { await worker(job); }
    catch(e){ console.error(e.message); }
  }
}
module.exports = { addJob, runJobs };
