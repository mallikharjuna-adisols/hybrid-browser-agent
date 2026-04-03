
const { chromium } = require('playwright');

async function runPlan(plan){
  const browser = await chromium.launch({ headless:false });
  const page = await browser.newPage();
  for(const step of plan.steps){
    if(step.action==='navigate') await page.goto(step.target.value);
    if(step.action==='click') await page.getByText(step.target.value).click();
  }
}
module.exports = { runPlan };
