# n8n-nodes-firstpromoter

This is an n8n community node. It lets you use **FirstPromoter** APIs in your n8n workflows.

**FirstPromoter** is a modern and reliable affiliate tool for subscription-based/SaaS companies that enables you to track, manage, and optimize referral-based marketing programs. It is easy to set up, yet powerful to scale with your growing needs.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This package includes:

- **FirstPromoter v2** (actions): Use this node to call the FirstPromoter v2 API (referrals, promoters, tracking, commissions, promo codes, and custom API calls).
- **FirstPromoter Webhooks** (trigger): Use this node to receive real-time webhook events from FirstPromoter.
- **FirstPromoter (Legacy) v1** (actions): Use only if you still rely on v1 endpoints.

---

## Table of contents

- [Installation](#installation)
- [Credentials](#credentials)
- [Webhook setup](#webhook-setup-firstpromoter--n8n)
- [Operations](#operations)
- [Quick start](#quick-start-recommended-flow)
- [Usage](#usage)
- [Compatibility](#compatibility)
- [Version history](#version-history)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

This node supports the following FirstPromoter credentials:

- **FirstPromoter V2 API** (recommended)
- **FirstPromoter Legacy / V1 API** (legacy)

You’ll need to create an API key in FirstPromoter and paste it into the corresponding n8n credential.

### How to find your FirstPromoter API key

#### FirstPromoter V2 API key (recommended)

1. Log in to your **FirstPromoter** dashboard.
2. Go to **Settings → Integrations → Manage API keys**.
3. Create a new **V2 API key** (or copy an existing one).
4. In n8n, open the **FirstPromoter V2 API** credential and set:
   - **Account ID**: found in FirstPromoter under **Settings → Integrations → Account ID**
   - **API Key**: paste the V2 API key you created

**Tip:** If you rotate keys, update the n8n credential and re-run the workflow.

#### FirstPromoter Legacy / V1 API key (legacy)

1. Log in to your **FirstPromoter** dashboard.
2. Go to **Settings → Integrations → Manage API keys**.
3. Create or copy a **V1 (Legacy) API key** (if your account still uses v1 endpoints).
4. In n8n, open the **FirstPromoter Legacy / V1 API** credential and paste the key.

---

## Webhook setup (FirstPromoter → n8n)

### 1) Add the trigger node in n8n

- Create a new workflow in n8n.
- Add the **FirstPromoter Webhooks** node (Trigger).
- In **Events**, select the webhook event types you want to receive.
- **Save** the workflow.

### 2) Copy the webhook URL from n8n

- Open the **FirstPromoter Webhooks** node.
- Copy the webhook URL shown by n8n.
  - Use the **Test URL** while testing.
  - Use the **Production URL** after activating the workflow.

### 3) Configure the webhook in FirstPromoter

- In FirstPromoter, go to **Settings → Integrations → Webhooks**.
- Click **Add webhook**.
- Paste the n8n webhook URL.
- Select the **campaign**.

- Verify it works:
  - Click **Select event**.
  - Select an event that matches one of the events selected in n8n.
  - Click **Run Test**.
  - Ensure your n8n workflow is running and listening before you click **Run Test**.
  -In n8n, check the workflow execution: the webhook payload will appear as output from the **FirstPromoter Webhooks** node.
- Save the webhook.


### Endpoint details (reference)

- **Method**: `POST`
- **Path**: `/firstpromoter`

### Webhook event types

- `lead_signup` (Lead Signup)
- `lead_cancelled` (Lead Cancelled)
- `promoter_signs_up` (Promoter Signs Up)
- `promoter_accepted` (Promoter Accepted)
- `reward_created` (Reward Created)
- `lead_becomes_referral` (New Customer)
- `fulfilment_pending` (Fulfilment Pending)

### Notes

- For `fulfilment_pending`, you can set **Fulfilment Pending Response Code** in the node to control whether FirstPromoter keeps the fulfilment pending or marks it as fulfilled.

---

## Operations

### v1 operations

#### Lead/Customer

- Show Lead/Customer Details
- List Leads/Customers
- Modify Lead/Customer

#### Tracking

- Track Signup
- Track Sale
- Track Refund
- Track Cancellation

#### Reward

- Create Reward
- List Rewards
- Update Reward

#### Promoter

- Create Promoter
- List Promoters
- Show Promoter Details and Balance
- Modify Existing Promoter
- Add Promoters to Campaign
- Move Promoter to Another Campaign
- Reset Promoter Authentication Token

#### Custom

- Make FirstPromoter API Call

### v2 operations

#### Referrals

- Delete Referral
- Get Referral
- List Referrals
- Move Referrals
- Update Referral

#### Tracking

- Track Signup
- Track Sale
- Track Refund
- Track Cancellation

#### Commissions

- Approve Commissions
- Create Custom Commission
- Create Sale Commission
- Deny Commissions
- List Commissions
- Mark Non-Monetary Commissions As Fulfilled
- Mark Non-Monetary Commissions As Unfulfilled
- Update Commission

#### Promoters

- Accept Promoters
- Add Promoters to Campaign
- Archive Promoters
- Assign Parent
- Block Promoters
- Create Promoter
- Get Promoter
- List Promoters
- Move Promoters to Campaign
- Reject Promoters
- Update Promoters

#### Promo Codes

- Archive Promo Code By ID
- Create Promo Code (Stripe Only)
- Get Promo Code By ID
- Get Promo Codes
- Update Promo Code By ID

#### Custom

- Make Firstromoter API Call

---

## Quick start (recommended flow)

### 1) Receive an event (Webhook)

1. Add **FirstPromoter Webhooks** to a new workflow.
2. Choose the **Events** you want to listen for.
3. Save and **Test** (or **Activate**) the workflow.
4. Copy the webhook URL and add it in FirstPromoter:
   - **Settings → Integrations → Webhooks**
5. Trigger the event in FirstPromoter to confirm n8n receives the payload.

### 2) Process the event (API node)

1. Add **FirstPromoter v2** after the webhook node.
2. Create a **FirstPromoter v2** credential in n8n:
   - **Account ID**
   - **API Key**
3. Use the webhook payload in expressions (for example: `{{$json.event.type}}`, `{{$json.data.id}}`) to drive follow-up actions.

---

## Usage

### Custom API call (Advanced)

Use **FirstPromoter v2 → Custom API** when you need an endpoint not covered by the node operations.

- Provide:
  - **Method** (GET/POST/PUT/DELETE)
  - **URL Path** (example: `/company/promoters` — do not include the base URL)
  - Optional **Query String Parameters**
  - Optional **Headers**
  - Optional **Body** (JSON)
- Tip: Only set the parameters you need. Empty values are ignored.

---

## Compatibility

- **n8n**: `^1.0.0`
- **Node**: `>=22.22.0`

## Version history
- 0.1.0

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [FirstPromoter v1 documentation](https://docs.firstpromoter.com/api-reference-v1/introduction)
- [FirstPromoter v2 documentation](https://docs.firstpromoter.com/api-reference-v2/api-admin/introduction)
- [FirstPromoter webhooks](https://docs.firstpromoter.com/webhooks/overview)
