const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');

async function run() {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN', { required: true });
  const userMappingInput = core.getInput('user-mapping', { required: true });
  const approvalCount = core.getInput('approval-count', { required: true });

  const githubToSlackUserMap = JSON.parse(userMappingInput)

  const octokit = getOctokit(GITHUB_TOKEN);

  const checkApprovals = async () => {
    const { owner, repo, number } = context.issue;

    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: number,
    });

    const branchName = pullRequest.head.ref;
    const prOwner = pullRequest.user.login;
    const prUrl = pullRequest.html_url;

    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: number,
    });

    const approved = reviews.filter((review) => review.state === 'APPROVED');

    if (approved.length >= approvalCount) {
      core.setOutput('approvals', true);
    } else {
      core.setOutput('approvals', false);
    }

    core.setOutput('branch-name', branchName);
    core.setOutput('pr-owner', prOwner);
    core.setOutput('pr-url', prUrl);
    
    if (githubToSlackUserMap[prOwner]) {
      core.setOutput('slack-user', githubToSlackUserMap[prOwner]);
    } else {
      core.setOutput('slack-user', prOwner);
    }
  };

  await checkApprovals();
}

run();
