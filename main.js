const checkApprovals = require('./logic/checkApproval');

async function run() {
  await checkApprovals();
}

run();

module.exports = run;
