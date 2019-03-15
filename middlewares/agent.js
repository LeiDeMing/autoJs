const setSuperagent = require('../controllers/setSuperagent')

async function agent(url) {
    const res = await setSuperagent(url);
    return res
}

module.exports=agent;