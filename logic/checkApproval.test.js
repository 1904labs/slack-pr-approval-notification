const axios = require('axios');
const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');
const checkApproval = require('./checkApproval');

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
  });

  it('should send a message to Slack when the approval count is reached', async () => {
    const GITHUB_TOKEN = 'test-token';
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx/yyy';
    const userMapping = JSON.stringify({ testuser: 'U123456789' });
    const approvalCount = '2';

    const axiosSpy = jest.spyOn(axios, 'request');
    axiosSpy.mockResolvedValue({ status: 200, data: { status: 'ok' } });

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

    await checkApproval();

    // add a timeout for async functions to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(core.getInput).toHaveBeenCalledTimes(4);
    expect(mockOctokit.rest.pulls.get).toHaveBeenCalledTimes(1);
    expect(mockOctokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);

    expect(axiosSpy).toHaveBeenCalledWith({
      data: {
        'approval-count': '2',
        approvals: 'true',
        'branch-name': 'test-branch',
        'pr-owner': 'githubUser',
        'pr-url': 'https://github.com/test-owner/test-repo/pull/1',
        'slack-user': undefined,
      },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: 'https://hooks.slack.com/services/xxx/yyy',
    });
  });

  it('should NOT send a message to slack when the approval count is NOT reached', async () => {
    const GITHUB_TOKEN = 'test-token';
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx/yyy';
    const userMapping = JSON.stringify({ testuser: 'U123456789' });
    const approvalCount = '2';

    const axiosSpy = jest.spyOn(axios, 'request');
    axiosSpy.mockResolvedValue({ status: 200, data: { status: 'ok' } });

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
            data: [{ state: 'APPROVED' }],
          }),
        },
      },
    };

    getOctokit.mockReturnValue(mockOctokit);

    await checkApproval();

    // add a timeout for async functions to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(core.getInput).toHaveBeenCalledTimes(4);
    expect(mockOctokit.rest.pulls.get).toHaveBeenCalledTimes(1);
    expect(mockOctokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);

    expect(axiosSpy).toHaveBeenCalledTimes(0);
  });

  it('should NOT send a message to slack if the number of approvals is more than the required count', async () => {
    const GITHUB_TOKEN = 'test-token';
    const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx/yyy';
    const userMapping = JSON.stringify({ testuser: 'U123456789' });
    const approvalCount = '2';

    const axiosSpy = jest.spyOn(axios, 'request');
    axiosSpy.mockResolvedValue({ status: 200, data: { status: 'ok' } });

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
            data: [
              { state: 'APPROVED' },
              { state: 'APPROVED' },
              { state: 'APPROVED' },
            ],
          }),
        },
      },
    };

    getOctokit.mockReturnValue(mockOctokit);

    await checkApproval();

    // add a timeout for async functions to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(core.getInput).toHaveBeenCalledTimes(4);
    expect(mockOctokit.rest.pulls.get).toHaveBeenCalledTimes(1);
    expect(mockOctokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);

    expect(axiosSpy).toHaveBeenCalledTimes(0);
  });
});
