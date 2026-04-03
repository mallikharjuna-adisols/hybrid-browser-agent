
async function loadSession(browser){
  return await browser.newContext();
}
module.exports = { loadSession };
