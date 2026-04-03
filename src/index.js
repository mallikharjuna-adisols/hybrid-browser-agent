
const { runJobs, addJob } = require('./orchestrator/jobRunner');

addJob({ flow: 'demo' });

runJobs(async (job) => {
  console.log('Running job:', job.flow);
});
