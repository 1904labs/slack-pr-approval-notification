# GitHub PR Approval Slack Notification - GitHub Action

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)

This [GitHub Action](https://github.com/features/actions) sends a message via Slack workflows to a channel. It tags the owner of a Pull Request (PR), informing them that their PR has received the minimum number of approvals required for merging.

**Screenshot**

<img width="594" alt="Screenshot 2023-05-10 at 3 15 58 PM" src="https://github.com/1904labs/slack-pr-approval-notification/assets/43356690/5814aa06-2197-4736-98b8-e8f58c8b4df9">

## Usage

You can use this action after any other action. However, it also makes sense as a standalone workflow that runs independently. :)

1. Create a `.github/workflows/slack-notify.yml` file in your GitHub repo.
2. Add the following code to the `slack-notify.yml` file.

```yml
name: 2 PR Approval Slack Notification
on:
  pull_request_review:
    types:
      - submitted
jobs:
  check-for-PR-approval-and-send-slack-notification:
    runs-on: ubuntu-latest

    steps:
      - name: Get Code
        uses: actions/checkout@v3
      - name: Check for 2 approvals
        id: approval-check
        uses: 1904labs/slack-pr-approval-notification@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          user-mapping: '{"githubUser1":"U123456789","githubUser2":"U987654321"}'
          approval-count: 2
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

3. [Create a Slack workflow](https://slack.com/help/articles/360053571454-Set-up-a-workflow-in-Slack) with a webhook as the trigger.

   1. Name your Slack variables as follows:

      | Variable       | Type          |
      | -------------- | ------------- |
      | branch-name    | string        |
      | approvals      | string        |
      | pr-url         | string        |
      | pr-owner       | string        |
      | slack-user     | Slack user ID |
      | approval-count | string        |

   2. Finalize your workflow configuration by designating the channel for receiving notifications. This process will generate a webhook URL.

4. Subsequently, establish the `SLACK_WEBHOOK_URL` by [creating a secret within your GitHub Action's settings](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository).

## Action Inputs

By default, this action takes 4 required inputs:

| Input             | Purpose                                                                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GITHUB_TOKEN      | Allows access to your code to check PR approvals. GitHub automatically generates this token, all you have to do is use `${{ secrets.GITHUB_TOKEN }}`                                                                                                                                                    |
| user-mapping      | A stringified JSON object with a user's GitHub handle as the key, and the same user's Slack ID as the value. [Check out how to find a Slack user ID here](https://moshfeu.medium.com/how-to-find-my-member-id-in-slack-workspace-d4bba942e38c). Example: '{"bob": "U123131312", "sarah": "U4392948393}' |
| approval-count    | The number of approvals required on a PR to send a notification to Slack                                                                                                                                                                                                                                |
| SLACK_WEBHOOK_URL | The webhook URL generated by a Slack workflow                                                                                                                                                                                                                                                           |

## Slack Workflow Configuration

Below is a an example screenshot showing how to setup the Slack workflow's text to use the GitHub action

<img width="503" alt="Screenshot 2023-05-12 at 12 24 07 PM" src="https://github.com/1904labs/slack-pr-approval-notification/assets/43356690/5499e5b5-920f-41aa-b6ce-abd1fc32b82c">

## License

[MIT](LICENSE) © 2023 1904labs

### Proudly Built In St. Louis ❤️
