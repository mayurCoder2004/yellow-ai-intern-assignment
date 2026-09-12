# Yellow AI Assignment 1: GitHub Lead Sniper

## Overview

This project implements an n8n automation that monitors new stargazers of a public GitHub repository, identifies high-value leads, generates a personalized sales pitch using Google Gemini, and sends the result to Discord.

## Repository Monitored

- GitHub repository: `mayurCoder2004/chefmate`
- Polling interval: Every 5 minutes

## Workflow

```text
Schedule Trigger
      ↓
Fetch Stargazers
      ↓
If row does not exist
      ↓
Insert row
      ↓
Fetch GitHub Profile
      ↓
High-Value Lead?
      ↓ TRUE
Generate Sales Pitch
      ↓
Send Lead to Discord
```

Users that fail the high-value condition follow the FALSE branch and are not sent to the AI or Discord steps.

## Lead Qualification

A GitHub user is considered a high-value lead when either condition is true:

```text
followers > 100 OR public_repos > 50
```

## AI Sales Pitch

Google Gemini analyzes the GitHub user's:

- Name
- Bio
- Company

The prompt instructs Gemini to generate exactly one concise, personalized sentence focused on a potential professional/business opportunity.

## Duplicate Detection

A Data Table named `Processed Stargazers` stores processed GitHub usernames.

Before processing a stargazer, the workflow checks whether their username already exists in the table. Existing users are skipped, preventing duplicate processing.

## GitHub API Rate-Limit Handling

Both GitHub API HTTP Request nodes use n8n's Retry On Fail configuration:

- Maximum tries: 3
- Wait between tries: 1 second
- On error: Stop Workflow

This provides a controlled retry mechanism for transient API or rate-limit-related failures and avoids repeatedly sending requests immediately after a failure.

The implementation uses a fixed retry delay and does not claim to read GitHub's `X-RateLimit-Reset` header.

## Discord Notification

For qualified leads, the workflow sends a Discord webhook notification containing:

- Name
- Bio
- AI-generated Sales Pitch

Example:

```text
🚨 New High-Value GitHub Lead

👤 Name: <Name>
📝 Bio: <Bio>
💡 Sales Pitch: <AI-generated pitch>
```

## Credentials / Setup

The workflow uses n8n credentials for:

1. GitHub API
2. Google Gemini

The submitted workflow intentionally replaces the Discord webhook URL with:

```text
YOUR_DISCORD_WEBHOOK_URL
```

After importing the workflow, replace this placeholder in the `Send Lead to Discord` node with a valid Discord webhook URL.

Do not commit or publicly share API keys, access tokens, or webhook secrets.

## Importing the Workflow

1. Open n8n.
2. Import `yellow-ai-github-lead-sniper-submission.json`.
3. Configure the GitHub credential.
4. Configure the Google Gemini credential.
5. Replace `YOUR_DISCORD_WEBHOOK_URL` in `Send Lead to Discord`.
6. Save the workflow.
7. Execute the workflow manually for testing, or activate it for scheduled execution.

## Testing

The workflow was tested for:

- Successful GitHub stargazer retrieval
- New stargazer detection
- Duplicate stargazer prevention
- GitHub profile retrieval
- High-value TRUE branch
- Non-high-value FALSE branch
- Gemini sales pitch generation
- Successful Discord delivery
- End-to-end workflow execution

A successful Discord notification screenshot is included with the submission.

## Submission Files

- `yellow-ai-github-lead-sniper-submission.json` - n8n workflow export
- `LOGIC_LOG.md` - workflow logic and rate-limit handling
- `discord-success.png` - successful Discord notification screenshot
- `README.md` - project documentation
