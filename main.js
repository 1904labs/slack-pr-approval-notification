const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');
const axios = require('axios');

async function run() {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN', { required: true });
  const SLACK_WEBHOOK_URL = core.getInput('SLACK_WEBHOOK_URL', {
    required: true,
  });
  const userMappingInput = core.getInput('user-mapping', { required: true });
  const approvalCount = core.getInput('approval-count', { required: true });

  const githubToSlackUserMap = JSON.parse(userMappingInput);

  const octokit = getOctokit(GITHUB_TOKEN);

  const checkApprovals = async () => {
    try {
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
        let data = JSON.stringify({
          'branch-name': branchName,
          approvals: true,
          'pr-url': prUrl,
          'pr-owner': prOwner,
          'slack-user': githubToSlackUserMap[prOwner],
          'approval-count': approvalCount,
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: SLACK_WEBHOOK_URL,
          headers: {
            'Content-Type': 'text/plain',
          },
          data: data,
        };

        await axios.request(config);
      }
    } catch (e) {
      console.log('Something went wrong!', e);
    }
  };

  await checkApprovals();
}

run();

module.exports = run;
