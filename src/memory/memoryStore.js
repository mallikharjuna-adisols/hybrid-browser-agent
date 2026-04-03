
const fs = require('fs-extra');
const FILE='./data/flows.json';
async function save(name,plan){
  const d=await fs.readJson(FILE).catch(()=>({}));
  d[name]=plan;
  await fs.writeJson(FILE,d,{spaces:2});
}
module.exports={save};
