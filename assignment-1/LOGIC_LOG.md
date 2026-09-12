# Logic Log: Yellow AI - GitHub Lead Sniper

## 1. Objective

This n8n workflow monitors the stargazers of the public
`mayurCoder2004/chefmate` GitHub repository and identifies potentially
high-value developers for outreach.

## 2. Workflow Logic

1.  **Schedule Trigger**
    -   Polls the GitHub repository every 5 minutes.
2.  **Fetch Stargazers**
    -   Calls the GitHub REST API:
        `GET /repos/mayurCoder2004/chefmate/stargazers`
    -   The GitHub credential is configured in n8n rather than
        hardcoding the access token.
3.  **New Stargazer Detection**
    -   A Data Table named `Processed Stargazers` stores usernames that
        have already been processed.
    -   `If row does not exist` checks the incoming GitHub `login`.
    -   If the username already exists, that stargazer is not processed
        again.
    -   If the username is new, it is inserted into the Data Table and
        continues.
4.  **GitHub Profile Enrichment**
    -   For each new stargazer, the workflow calls:
        `GET /users/{username}`
    -   The profile provides fields including `name`, `bio`, `company`,
        `followers`, and `public_repos`.
5.  **High-Value Lead Filter**
    -   A lead qualifies when: `followers > 100 OR public_repos > 50`
    -   Qualified users continue to the AI step.
    -   Users who do not satisfy either condition stop at the FALSE
        branch.
6.  **AI Sales Pitch**
    -   Google Gemini analyzes the user's `bio` and `company`.
    -   The prompt requires exactly one personalized sentence focused on
        a potential professional/business opportunity.
    -   The AI output is used as the Sales Pitch.
7.  **Discord Notification**
    -   Qualified leads are sent to the configured Discord webhook.
    -   The notification contains:
        -   Name
        -   Bio
        -   AI-generated Sales Pitch

## 3. GitHub API Rate-Limit / Failure Handling

Both GitHub HTTP Request nodes, `Fetch Stargazers` and
`Fetch GitHub Profile`, use n8n's **Retry On Fail** setting.

Configuration: - Maximum tries: **3** - Wait between tries: **1,000
ms** - On error: **Stop Workflow**

This provides a controlled retry mechanism for transient GitHub API or
rate-limit-related failures and avoids immediately repeating failed
requests. If all retry attempts fail, the workflow stops instead of
continuing to send additional requests.

This implementation uses a fixed retry delay. It does **not** claim to
read GitHub's `X-RateLimit-Reset` header or dynamically calculate the
reset time.

## 4. Testing Performed

### High-Value Lead Test

A GitHub profile satisfying the high-value condition successfully passed
through the TRUE branch, generated an AI Sales Pitch, and produced a
Discord notification.

### Non-High-Value Lead Test

A profile with both `followers <= 100` and `public_repos <= 50`
successfully passed through the FALSE branch and did not continue to the
AI/Discord steps.

### End-to-End Test

The complete workflow successfully executed the path:
`GitHub Stargazer → New User Check → Profile Enrichment → High-Value Filter → AI Sales Pitch → Discord`

## 5. Security / Credentials

GitHub and Gemini credentials are stored using n8n credentials. The
Discord webhook is configured in the HTTP Request node and is not
included in this Logic Log.

## 6. Result

The workflow satisfies the required Lead Sniper flow: monitor new GitHub
stargazers, enrich their profiles, qualify high-value leads, generate a
one-sentence AI sales pitch, and notify the sales channel.
