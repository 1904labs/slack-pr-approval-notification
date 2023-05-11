const nock = require('nock');
const axios = require('axios');
const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');
const run = require('./main');

jest.mock('@actions/core');
jest.mock('@actions/github', () => ({
  ...jest.requireActual('@actions/github'),
  context: {
    issue: {
      owner: 'test-owner',
      repo: 'test-repo',
      number: 1,
    },
  },
  getOctokit: jest.fn(),
}));
jest.mock('axios');

describe('GitHub Action', () => {
  afterEach(() => {
    jest.resetAllMocks();
    nock.cleanAll();
  });

  it('should send a message to Slack when the approval count is reached', async () => {
    const GITHUB_TOKEN = 'test-token';
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx/yyy';
    const userMapping = '{"testuser": "U123456789"}';
    const approvalCount = 2;

    core.getInput
      .mockReturnValueOnce(GITHUB_TOKEN)
      .mockReturnValueOnce(SLACK_WEBHOOK_URL)
      .mockReturnValueOnce(userMapping)
      .mockReturnValueOnce(approvalCount);

    const mockOctokit = {
      rest: {
        pulls: {
          get: jest.fn().mockResolvedValue({
            data: {
              head: { ref: 'test-branch' },
              user: { login: 'githubUser' },
              html_url: 'https://github.com/test-owner/test-repo/pull/1',
            },
          }),
          listReviews: jest.fn().mockResolvedValue({
            data: [{ state: 'APPROVED' }, { state: 'APPROVED' }],
          }),
        },
      },
    };

    getOctokit.mockReturnValue(mockOctokit);

    const slackMock = nock(SLACK_WEBHOOK_URL)
      .post('/')
      .reply(200, { status: 'ok' });

    axios.post.mockResolvedValue({ status: 200, data: { status: 'ok' } });

    await run();

    expect(core.getInput).toHaveBeenCalledTimes(4);
    expect(mockOctokit.rest.pulls.get).toHaveBeenCalledTimes(1);
    expect(mockOctokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);
    expect(slackMock.isDone()).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(SLACK_WEBHOOK_URL, {
      'branch-name': 'test-branch',
      approvals: true,
      'pr-url': 'https://github.com/test-owner/test-repo/pull/1',
      'pr-owner': 'githubUser',
      'slack-user': 'slackUser',
      'approval-count': approvalCount,
    });
  });
});
