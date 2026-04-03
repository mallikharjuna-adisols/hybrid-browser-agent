
async function healStep(step, ui){
  const match = ui.buttons?.find(b=>b.includes(step.target.value));
  if(match){ step.target.value = match; return step; }
  throw new Error('heal failed');
}
module.exports = { healStep };
