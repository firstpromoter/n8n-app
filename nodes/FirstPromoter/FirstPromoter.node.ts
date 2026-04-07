import  {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	IHttpRequestMethods,
	NodeOperationError,
	NodeApiError,
	JsonObject,
	NodeConnectionTypes
} from 'n8n-workflow';

import { buildCustomFields, omitEmpty } from '../helper/utils';

export class FirstPromoter implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FirstPromoter v2',
		icon: 'file:../../icons/firstpromoter.svg',
		name: 'firstPromoter',
		group: ['transform'],
		version: 2,
		description: 'Interact with FirstPromoter V2 API',
		usableAsTool: true,
		defaults: { name: 'FirstPromoter v2' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'firstPromoterVersion2Api', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Commission', value: 'commissions' },
					{ name: 'Custom FirstPromoter API', value: 'custom' },
					{ name: 'Promo Code', value: 'promo codes' },
					{ name: 'Promoter', value: 'promoters' },
					{ name: 'Referral', value: 'referrals' },
					{ name: 'Tracking', value: 'tracking' },
				],
				default: 'referrals',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['referrals'] },
				},
				options: [
					{ name: 'Delete Referral', value: 'delete referrals', action: 'Delete a referral' },
					{ name: 'Get Referral', value: 'get referrals', action: 'Get referral details' },
					{ name: 'List Referrals', value: 'list referrals', action: 'List referrals' },
					{ name: 'Move Referrals', value: 'move', action: 'Move referrals to promoter' },
					{ name: 'Update Referral', value: 'update referrals', action: 'Update referral' },
				],
				default: 'list referrals',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['tracking'] },
				},
				options: [
					{ name: 'Track Cancellation', value: 'cancellation', action: 'Track cancellation' },
					{ name: 'Track Refund', value: 'refund', action: 'Track a refund' },
					{ name: 'Track Sale', value: 'sale', action: 'Track a sale' },
					{ name: 'Track Signup', value: 'signup', action: 'Track a lead signup' },
				],
				default: 'sale',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['commissions'] },
				},
				options: [
					{ name: 'Approve Commissions', value: 'approve commissions', action: 'Approve commissions' },
					{ name: 'Create Custom Commission', value: 'create custom commission', action: 'Create a custom commission' },
					{ name: 'Create Sale Commission', value: 'create commission', action: 'Create a sale commission' },
					{ name: 'Deny Commissions', value: 'deny commissions', action: 'Deny a commission' },
					{ name: 'List Commissions', value: 'list commissions', action: 'List commissions' },
					{ name: 'Mark Non-Monetary Commissions As Fulfilled', value: 'mark commission fulfilled', action: 'Mark non monetary commissions as fulfilled' },
					{ name: 'Mark Non-Monetary Commissions As Unfulfilled', value: 'mark commission unfulfilled', action: 'Mark non monetary commissions as unfulfilled' },
					{ name: 'Update Commission', value: 'update commission', action: 'Update a commission' },
					
				],
				default: 'list commissions',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['promoters'] },
				},
				options: [
					{ name: 'Accept Promoters', value: 'accept', action: 'Accept promoters' },
					{
						name: 'Add Promoters to Campaign',
						value: 'add promoters',
						action: 'Add promoters to a campaign',
					},
					{ name: 'Archive Promoters', value: 'archive', action: 'Archive promoters' },
					{
						name: 'Assign Parent',
						value: 'assign parent',
						action: 'Assign a parent promoter',
					},
					{ name: 'Block Promoters', value: 'block', action: 'Block promoters' },
					{ name: 'Create Promoter', value: 'create promoter', action: 'Create a promoter' },
					{ name: 'Get Promoter', value:  'get promoter', action: 'Get a promoter details' },
					{ name: 'List Promoters', value: 'list promoters', action: 'List promoters' },
					{
						name: 'Move Promoters to Campaign',
						value: 'move promoters',
						action: 'Move promoters to a campaign',
					},
					{ name: 'Reject Promoters', value: 'reject', action: 'Reject promoters' },
					{ name: 'Update Promoters', value: 'update promoter', action: 'Update a promoter' },
				],
				default: 'list promoters',
			},
            {
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['promo codes'] },
				},
				options: [
					{ name: 'Archive Promo Code By ID', value: 'archive promo code by id', action: 'Archive a promo code by ID'  },
					{ name: 'Create Promo Code (Stripe Only)', value: 'create promo code', action: 'Create a promo code for stripe account only' },
					{ name: 'Get Promo Code By ID', value: 'get promo code by id', action: 'Get a promo code details by ID' },
					{ name: 'Get Promo Codes', value: 'get promo codes', action: 'Get promo codes' },
					{ name: 'Update Promo Code By ID', value: 'update promo code by id', action: 'Update a promo code by ID' },
				],
				default: 'get promo codes',
			},
            {
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['custom'] },
				},
				options: [
					{ name: 'Make Firstromoter API Call', value: 'api', action: 'Make a custom v2 API call' },
				],
				default: 'api',
			},

			// tracking parameters would go here...
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'lead@example.com',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup', 'sale', 'refund', 'cancellation'],
					},
				},
				description: 'Email of the user lead/referral',
			},
			{
				displayName: 'UID',
				name: 'uid',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup', 'sale', 'refund', 'cancellation'],
					},
				},
				description: 'UID (User ID) of the lead/referral',
			},
			{
				displayName: 'TID',
				name: 'tid',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: 'Vistor Tracking ID (tid). The _fprom_tid cookie value.',
			},
			{
				displayName: 'Ref ID (Promoter Referral ID)',
				name: 'ref_id',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: 'Promoter Referral ID (ref_id). The _fprom_ref_id cookie value.',
			},
			{
				displayName: 'IP Address',
				name: 'ip',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: 'IP Address of the user signing up',
			},
			// Additional parameters would go here...
			{
				displayName: 'Created At',
				name: 'created_at',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: 'Timestamp of when the user signed up',
			},
			{
				displayName: 'Skip Email Notification',
				name: 'skip_email_notification',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: 'Whether to skip sending email notification',
			},

			// additional sale tracking parameters would go here...

			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale', 'refund'],
					},
				},
				description:
					'The sale amount in cents. For zero-decimal currencies like JPY, amount should be whole values.',
			},
			{
				displayName: 'Event ID',
				name: 'event_id',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale', 'refund'],
					},
				},
				description: 'Transaction or sale event ID. Required to avoid duplicate sales.',
			},
			{
				displayName: 'Plan',
				name: 'plan',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale'],
					},
				},
				description: 'Customer plan ID from billing provider. Used for plan-level rewards.',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale', 'refund'],
					},
				},
				description: 'Required only if different from FirstPromoter settings default currency',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale', 'refund'],
					},
				},
				description: 'Number of subscriptions/items. Optional if quantity is 1.',
			},

			{
				displayName: 'Promo Code',
				name: 'promo_code',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale'],
					},
				},
				description:
					'For promo code tracking. The promo code used by the customer during checkout.',
			},
			{
				displayName: 'MRR',
				name: 'mrr',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale'],
					},
				},
				description: 'Monthly Recurring Revenue generated by the customer',
			},
			{
				displayName: 'Sale Event ID',
				name: 'sale_event_id',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['refund'],
					},
				},
				description:
					'The event ID of the sale for which the refund is processed. Should match the event_id from the sales tracking API call. Required for accurate tracking of multiple products or changing commission levels.',
			},
			{
				displayName: 'TID',
				name: 'tid',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale'],
					},
				},
				description: "Visitor's Tracking ID (tid). The _fprom_tid cookie value.",
			},
			{
				displayName: "Ref ID (Promoter's Referral ID)",
				name: 'ref_id',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale'],
					},
				},
				description: "Promoter's Referral ID (ref_id). The _fprom_ref_id cookie value.",
			},
			{
				displayName: 'Skip Email Notification',
				name: 'skip_email_notification',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['sale'],
					},
				},
				description: 'Whether to skip sending email notification',
			},

			// Referral parameters would go here...
			// get referral details parameters would go here...
			{
				displayName: 'Find by Attribute',
				name: 'findReferralBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'ID', value: 'id' },
					{ name: 'UID', value: 'uid' },
					{ name: 'Username', value: 'username' },
				],
				default: 'id', // 'id', 'uid', 'email', 'username'
				description: 'Find a referral by its ID, Email, or Username',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['get referrals'],
					},
				},
			},
			{
				displayName: 'Attribute Value',
				name: 'attributeValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['get referrals'],
					},
				},
				description:
					'The value of the attribute to find the referral by. For example, the ID of the referral, UID of the referral, email of the referral, or username of the referral.',
			},

			// update referral parameters would go here...
			{
				displayName: 'Find by Attribute',
				name: 'findReferralBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Email', value: 'email' },
					{ name: 'ID', value: 'id' },
					{ name: 'UID', value: 'uid' },
					{ name: 'Username', value: 'username' },
				],
				default: 'id', // 'id', 'uid', 'email', 'username'
				description: 'Find a referral to update by its ID, UID, Email, or Username',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['update referrals'],
					},
				},
			},
			{
				displayName: 'Attribute Value',
				name: 'attributeValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['update referrals'],
					},
				},
				description:
					'The value of the attribute to find the referral by. For example, the ID of the referral, UID of the referral, email of the referral, or username of the referral.',
			},
			// promoter_campaign_id
			{
				displayName: 'Promoter Campaign ID',
				name: 'promoterCampaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['update referrals'],
					},
				},
				description:
					'Promoter Campaign ID, you can obtain this for each promoter from the promoters endpoint. It is the ID that pairs a promoter to a campaign. Not the campaign ID.',
			},
			{
				displayName: 'Split Details Percentage',
				name: 'splitDetailsPercentage',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['update referrals'],
					},
				},
				description:
					'Percentage value of the split between 0 and 100. Note: Reach out to us on support if you need this. It needs to be enabled before you can use it.',
			},
			{
				displayName: 'Promoter Campaign ID to split details for',
				name: 'splitDetailsPromoterCampaignId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['update referrals'],
					},
				},
				description:
					'Promoter Campaign ID on which you want the split. Note: Reach out to us on support if you need this. It needs to be enabled before you can use it.',
			},
			// delete referrals parameters would go here...
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['delete referrals'],
					},
				},
				description:
					'ID of the referrals to delete. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},
			// move referrals to promoter parameters would go here...
			{
				displayName: 'Promoter Campaign ID',
				name: 'promoterCampaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['move'],
					},
				},
				description:
					'Destination promoter campaign ID. You can obtain this for each promoter from the promoters endpoint. It is the ID that pairs a promoter to a campaign. Not the campaign ID.',
			},
			{
				displayName: 'Referral IDs',
				name: 'referralIds',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['move'],
					},
				},
				description:
					'IDs of the referrals to move to a promoter. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			// Promoter parameters would go here...

			// get promoter details parameters would go here...
			{
				displayName: 'Find by Attribute',
				name: 'findPromoterBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Auth Token', value: 'auth_token' },
					{ name: 'Email', value: 'email' },
					{ name: 'ID', value: 'id' },
					{ name: 'Promo Code', value: 'promo_code' },
					{ name: 'Referral Token', value: 'ref_token' },
				],
				default: 'id', // 'auth_token', 'email', 'id', 'promo_code', 'ref_token'
				description: 'Find a promoter by its Auth Token, Email, ID, Promo Code, or Referral Token',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: [ 'get promoter'],
					},
				},
			},
			{
				displayName: 'Attribute Value',
				name: 'attributeValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: [ 'get promoter'],
					},
				},
				description:
					'The value of the attribute to find the promoter by. For example, the Auth Token, Email, ID, Promo Code, or Referral Token of the promoter.',
			},

			// update promoter parameters would go here...
			{
				displayName: 'Find by Attribute',
				name: 'findPromoterBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Auth Token', value: 'auth_token' },
					{ name: 'Email', value: 'email' },
					{ name: 'ID', value: 'id' },
					{ name: 'Promo Code', value: 'promo_code' },
					{ name: 'Referral Token', value: 'ref_token' },
				],
				default: 'id', // 'auth_token', 'email', 'id', 'promo_code', 'ref_token'
				description: 'Find a promoter by its Auth Token, Email, ID, Promo Code, or Referral Token',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['update promoter'],
					},
				},
			},
			{
				displayName: 'Attribute Value',
				name: 'attributeValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['update promoter'],
					},
				},
				description:
					'The value of the attribute to find the promoter by. For example, the Auth Token, Email, ID, Promo Code, or Referral Token of the promoter.',
			},

			// update promoter parameters would go here...

			{
				displayName: 'First Name',
				name: 'promoterFirstName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['update promoter'],
					},
				},
				description: 'First name of the promoter',
			},

			// create promoter parameters would go here...

			{
				displayName: 'Email',
				name: 'promoterEmail',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter'],
					},
				},
				description: 'Email address of the promoter',
			},
			{
				displayName: 'First Name',
				name: 'promoterFirstName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter'],
					},
				},
				description: 'First name of the promoter',
			},
			{
				displayName: 'Last Name',
				name: 'promoterLastName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Last name of the promoter',
			},
			{
				displayName: 'Cust ID',
				name: 'promoterCustId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description:
					"Cust ID of the promoter. This is the ID of the promoter in your customer's database that you want to link to the promoter.",
			},
			{
				displayName: 'Initial Campaign ID',
				name: 'promoterInitialCampaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter'],
					},
				},
				description: 'Initial campaign ID of the promoter',
			},
			{
				displayName: 'Drip Emails',
				name: 'promoterDripEmails',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter'],
					},
				},
				description: 'Whether to send a welcome email to the promoter',
			},
			{
				displayName: 'Website',
				name: 'promoterWebsite',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Website of the promoter',
			},
			{
				displayName: 'Company Name',
				name: 'promoterCompanyName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Company name of the promoter',
			},
			{
				displayName: 'Company Registration Number',
				name: 'promoterCompanyNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Company registration number of the promoter',
			},
			{
				displayName: 'Phone Number',
				name: 'promoterPhoneNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Phone number of the promoter',
			},
			{
				displayName: 'VAT ID',
				name: 'promoterVatId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},

				description: 'VAT ID of the promoter',
			},
			{
				displayName: 'Country',
				name: 'promoterCountry',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Country in 2 characters format. Example: US, UK, CA, etc.',
			},
			{
				displayName: 'Address',
				name: 'promoterAddress',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Address of the promoter',
			},
			{
				displayName: 'Avatar',
				name: 'promoterAvatar',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "URL to the promoter's avatar image",
			},
			{
				displayName: 'W8 Form URL',
				name: 'promoterW8FormUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "URL to the promoter's W8 form if available",
			},
			{
				displayName: 'W9 Form URL',
				name: 'promoterW9FormUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "URL to the promoter's W9 form if available",
			},
			{
				displayName: 'Description',
				name: 'promoterDescription',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: 'Description of the promoter',
			},
			{
				displayName: 'Instagram URL',
				name: 'promoterInstagramUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's Instagram URL if available",
			},

			{
				displayName: 'YouTube URL',
				name: 'promoterYouTubeUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's YouTube URL if available",
			},
			{
				displayName: 'LinkedIn URL',
				name: 'promoterLinkedinUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's LinkedIn URL if available",
			},
			{
				displayName: 'Facebook URL',
				name: 'promoterFacebookUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's Facebook URL if available",
			},
			{
				displayName: 'Twitter URL',
				name: 'promoterTwitterUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's Twitter URL if available",
			},
			{
				displayName: 'Twitch URL',
				name: 'promoterTwitchUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's Twitch URL if available",
			},
			{
				displayName: 'TikTok URL',
				name: 'promoterTiktokUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['create promoter', 'update promoter'],
					},
				},
				description: "Promoter's TikTok URL if available",
			},
			{
				displayName: 'Destroy W8 Form',
				name: 'profile_destroy_w8form',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['update promoter'],
					},
				},
				description: 'Whether to destroy the W8 form',
			},
			{
				displayName: 'Destroy W9 Form',
				name: 'profile_destroy_w9form',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['update promoter'],
					},
				},
				description: 'Whether to destroy the W9 form',
			},
			{
				displayName: 'Custom Fields',
				name: 'promoterCustomFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Custom Field',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['update promoter'],
					},
				},
				description:
					'Custom fields (hash). Keys must be from Settings > Affiliate portal > Custom fields. Values are String or Array of Strings. Sent as custom_fields[key]=value.',
				options: [
					{
						displayName: 'Custom Field',
						name: 'customField',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								placeholder: 'e.g. my_custom_field_key',
								description:
									'Custom field key from your FirstPromoter Settings > Affiliate portal > Custom fields',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								typeOptions: {
									multipleValues: true,
								},
								default: [],
								placeholder: 'Add value',
								description: 'Value for this custom field (string or multiple strings)',
							},
						],
					},
				],
			},

			// Get promoters list parameters would go here...
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['promoters', 'referrals', 'commissions'],
						operation: ['list promoters','list referrals', 'list commissions'],
					},
				},
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				default: 20,
				displayOptions: {
					show: {
						resource: ['commissions'],
						operation: ['list commissions'],
					},
				},
				description: 'Number of commissions to return per page',
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				default: 20,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['list promoters'],
					},
				},
				description: 'Number of promoters to return per page',
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				default: 20,
				displayOptions: {
					show: {
						resource: ['referrals'],
						operation: ['list referrals'],
					},
				},
				description: 'Number of referrals to return per page',
			},
			{
				displayName: 'Parent Promoter ID',
				name: 'parentPromoterId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['assign parent'],
					},
				},
				description: 'The ID of the parent promoter you want to assign the promoters to',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['assign parent'],
					},
				},
				description:
					'IDs of the promoters to assign a parent promoter. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			// move promoters to campaign parameters would go here...
			{
				displayName: 'From Campaign ID',
				name: 'fromCampaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['move promoters'],
					},
				},
				description: 'The ID of the campaign you want to move the promoters from',
			},
			{
				displayName: 'To Campaign ID',
				name: 'toCampaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['move promoters'],
					},
				},
				description: 'The ID of the campaign you want to move the promoters to',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['move promoters'],
					},
				},
				description:
					'IDs of the promoters to move to a campaign. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			{
				displayName: 'Soft Move Referrals',
				name: 'softMoveReferrals',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['move promoters'],
					},
				},
				description:
					'Whether to soft move the referrals. If true, move referrals to NEW campaign and future commissions from existing referrals will be tracked in the NEW campaign. However, if false, keep referrals in the old campaign and future commissions from existing referrals will be tracked in the OLD campaign.',
			},
			{
				displayName: 'Drip Emails',
				name: 'dripEmails',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['move promoters'],
					},
				},
				description: 'Whether to send drip emails to the promoter',
			},

			// add promoters to campaign parameters would go here...
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['add promoters'],
					},
				},
				description: 'The ID of the campaign you want to add the promoters to',
			},

			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['add promoters'],
					},
				},
				description:
					'IDs of the promoters to add to a campaign. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},
			{
				displayName: 'Drip Emails',
				name: 'dripEmails',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['add promoters'],
					},
				},
				description: 'Whether to send drip emails to the promoter',
			},

			// accept promoters parameters would go here...
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['accept'],
					},
				},
				description: 'The ID of the campaign promoter will be accepted to',
			},

			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['accept'],
					},
				},
				description:
					'IDs of the promoters to accept. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			// reject promoters parameters would go here...
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['reject'],
					},
				},
				description: 'The ID of the campaign promoter will be rejected from',
			},

			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['reject'],
					},
				},
				description:
					'IDs of the promoters to reject. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			// block promoters parameters would go here...
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['block'],
					},
				},
				description: 'The ID of the campaign promoter will be blocked from',
			},

			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['block'],
					},
				},
				description:
					'IDs of the promoters to block. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			// archive promoters parameters would go here...
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['archive'],
					},
				},
				description:
					'IDs of the promoters to archive. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			// Restore promoters parameters would go here...
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['promoters'],
						operation: ['restore'],
					},
				},
				description:
					'IDs of the promoters to restore. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},


			// Promo Codes parameters would go here...
			{
				displayName: 'Filter By Promoter Campaign ID',
				name: 'filterByPromoterCampaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['get promo codes'],
					},
				},
				description: 'Filters promo codes by promoter campaign ID',
			},

			// Archive Promo Code By ID parameters would go here...

			{
				displayName: 'Promo Code ID',
				name: 'promoCodeId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['archive promo code by id' , 'get promo code by id' , 'update promo code by id'],
					},
				},
				description: 'ID of the promo code',
			},
		
			// Create Promo Code (Stripe Only) parameters would go here...
			{
				displayName: 'Code',
				name: 'promoCode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['create promo code','update promo code by id'],
					},
				},
				description: 'Code of the promo code to create for stripe account only',
			},
			{
				displayName: 'Reward ID',
				name: 'rewardId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['create promo code'],
					},
				},
				description: 'ID of the reward',
			},
			{
				displayName: 'Promoter Campaign ID',
				name: 'promoterCampaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['create promo code','update promo code by id'],
					},
				},
				description: 'ID of the promoter campaign',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['create promo code','update promo code by id'],
					},
				},
				description: 'Description of the promo code',
			},

			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: {},
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['create promo code','update promo code by id'],
					},
				},
				description: 'Metadata of the promo code',
			},

			{
				displayName: 'Details',
				name: 'details',
				type: 'json',
				default: {},
				displayOptions: {
					show: {
					resource: ['promo codes'],
					operation: ['create promo code','update promo code by id'],
					},
				},
				description: 'Details of the promo code',
			},

			// Custom API Call parameters would go here...
			{
				displayName: 'URL Path',
				name: 'urlPath',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['custom'], operation: ['api'] },
				},
				description: 'The URL path of the endpoint. For example: `/company/promoters`. You don\'t need to add the base URL(https://api.firstpromoter.com/v2). You can find the available paths in the firstpromoter v2 api documentation.',
				placeholder: '/company/promoters',
			},
			{
				displayName: 'Method',
				name: 'method',
				type: 'options',
				default: 'GET',
				required: true,
				options: [
					{ name: 'DELETE', value: 'DELETE' },
					{ name: 'GET', value: 'GET' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
				],
				displayOptions: {
					show: { resource: ['custom'], operation: ['api'] },
				},
				description: 'Request Method of the custom API call',
			},
			{
				displayName: 'Body',    
				name: 'body',
				type: 'json',
				default: {},
				displayOptions: {
					show: { resource: ['custom'], operation: ['api'] },
				},
				description: 'Body of the custom API call',
			},
			{
				displayName: 'Query String Parameters',
				name: 'queryStringParameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Query String Parameter',
				displayOptions: {
					show: {
					resource: ['custom'],
					operation: ['api'],
					},
				},
				description:
					'Query string parameters of the custom API call',
				options: [
					{
					displayName: 'QueryParameters',
					name: 'queryParameters',
					values: [
						{
						displayName: 'Name',
						name: 'parameterName',
						type: 'string',
						default: '',
						placeholder: 'page',
						description:'Name of the parameter',
						},
						{
						displayName: 'Value',
						name: 'parameterValue',
						type: 'string',
						// typeOptions: {
						//   multipleValues: true,
						// },
						default: '',
						placeholder: 'Add value',
						description: 'Value for this parameter name',
						},
					],
					},
				],
			},
			{
				displayName: 'Headers Parameters',
				name: 'headersParams',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Header Parameter',
				displayOptions: {
					show: {
					resource: ['custom'],
					operation: ['api'],
					},
				},
				description:
					'Header parameters of the custom API call',
				options: [
					{
					displayName: 'HeaderParameters',
					name: 'headerParameters',
					values: [
						{
						displayName: 'Name',
						name: 'parameterName',
						type: 'string',
						default: '',
						placeholder: 'header name',
						description:'Name of the header parameter',
						},
						{
						displayName: 'Value',
						name: 'parameterValue',
						type: 'string',
						// typeOptions: {
						//   multipleValues: true,
						// },
						default: '',
						placeholder: 'header value',
						description: 'Value for this header parameter name',
						},
					],
					},
				],
			},

			// Commission paramters here
			{
				displayName: 'ID',
				name: 'commissionId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['commissions'],
						operation: ['update commission', 'get commission'],
					},
				},
				description: 'ID of the commission',
			},

			{
				displayName: 'IDs of Commisssions',
				name: 'commissionIDs',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						resource: ['commissions'],
						operation: ['approve commissions', 'deny commissions', 'mark commission fulfilled', 'mark commission unfulfilled'],
					},
				},
				description:
					'List of commission IDs. If there are more than `5` IDs, the action will be processed asynchronously. The available statuses are `pending`, `in_progress`, `completed`, `failed` and `stopped`',
			},

			{
				displayName: 'Find by Attribute',
				name: 'searchBy',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Referral Email', value: 'referral.email' },
					{ name: 'Referral UID', value: 'referral.uid' },
					{ name: 'Sale Event ID', value: 'event_id' },
				],
				default: 'referral.email', 
				description: 'Find commissions by Referral Email, Referral UID, Event ID of the sale',
				displayOptions: {
					show: {
						resource: ['commissions'],
						operation: ['list commissions'],
					},
				},
			},
			{
				displayName: 'Attribute Value',
				name: 'searchByAttributeValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['commissions'],
						operation: ['list commissions'],
					},
				},
				description:
					'The value of the attribute to find the commissions by. For example, Referral Email, Referral UID, Event ID of the sale.',
			},

			
			// Update Commission paramters here
			{
				displayName: 'Internal Note',
				name: 'commissionInternalNote',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['update commission'],
					},
				},
				description: 'Internal note visible only by the team',
			},
			{
				displayName: 'External Note',
				name: 'commissionExternalNote',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['update commission'],
					},
				},
				description: 'External note visible by the promoter',
			},


			
			// Create a custom commission
			// commission_type: 'custom',
			{
				displayName: 'Commission Amount',
				name: 'amount',
				type: 'number',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create custom commission'],
					},
				},
			},
			{
				displayName: 'Promoter Campaign ID',
				name: 'promoterCampaignId',
				type: 'number',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create custom commission'],
					},
				},
				description: 'PromoterCampaign ID required for custom commission type. This ID is not the promoter\'s ID or the campaign\'s ID. It\'s the linking record that defines the promoter\'s participation in that campaign. You can find this ID in each object in the promoter_campaigns array when you get the details of the promoter.'
			},
			{
				displayName: 'Commission Type',
				name: 'unit',
				type: 'options',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create custom commission'],
					},
				},
				options: [
					{ name: '', value: ''},
					{ name: 'Cash', value: 'cash'},
					{ name: 'Credits', value: 'credits'},
					{ name: 'Free Months', value: 'free_months'},
					{ name: 'Points', value: 'points'},
				],
				description: 'Select the reward/commission unit type',
			},


			// Create a sale commission
			// commission_type: 'sale',
			
			{
				displayName: 'Referral ID',
				name: 'referralId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission'],
					},
				},
				description: 'ID of the Referral',
			},
			{
				displayName: 'Sale Amount',
				name: 'saleAmount',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission'],
					},
				},
				description: 'ID of the Referral',
			},

			
			{
				displayName: 'Event ID',
				name: 'eventId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission'],
					},
				},
				description: 'The ID of the event that generated the sale from billing provider',
			},
			{
				displayName: 'Event Date',
				name: 'eventDate',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission', 'create custom commission'],
					},
				},
				description: 'The date of the event that generated the sale',
			},
			{
				displayName: 'Internal Note',
				name: 'internalNote',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission','create custom commission'],
					},
				},
				description: 'Internal note visible only by the team',
			},
			{
				displayName: 'External Note',
				name: 'externalNote',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission','create custom commission'],
					},
				},
				description: 'External note visible to every body. Thus, it would be visible to both internal team and promoters.',
			},
			{
				displayName: 'Notify Promoter',
				name: 'notifyPromoter',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission', 'create custom commission'],
					},
				},
				description: 'Whether to send email notification to promoter. If true a notification email is sent to promoter only if commission emails are enabled on Emails section.',
			},

			{
				displayName: 'Billing Period (Optional)',
				name: 'billingPeriod',
				type: 'options',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission'],
					},
				},
				options: [
					{ name: '', value: ''},
					{ name: 'Monthly', value: 'monthly'},
					{ name: 'One Time', value: 'one_time'},
					{ name: 'Yearly', value: 'yearly'},
				],
				description: 'The billing period of the event that generated the sale',
			},
			{
				displayName: 'Plan ID (Optional)',
				name: 'planId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
					resource: ['commissions'],
					operation: ['create commission'],
					},
				},
				description: 'One of the items ID from price IDs',
			},
			
			

			

        ],
    };

	async execute(this: IExecuteFunctions) {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let endpoint = '';
		let method: IHttpRequestMethods = 'GET';
		let body: IDataObject = {};
		let qs: IDataObject = {};
        const headers: IDataObject = {};

		if (resource === 'referrals') {
			switch (operation) {
				case 'list':
					endpoint = '/company/referrals';
					method = 'GET';
					qs = {
						page: this.getNodeParameter('page', 0, 1),
						per_page: this.getNodeParameter('perPage', 0, 20),
					};
					break;
				case 'get':
					{
						const findBy = this.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'id') {
							endpoint = `/company/referrals/${attributeValue}`;
						} else {
							endpoint = `/company/referrals/${attributeValue}?find_by=${findBy}`;
						}
					}
					method = 'GET';
					break;

				case 'update':
					{
						const findBy = this.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'uid') {
							endpoint = `/company/referrals/${attributeValue}?find_by=${findBy}`;
						} else if (findBy === 'email') {
							endpoint = `/company/referrals/${attributeValue}?find_by=${findBy}`;
						} else if (findBy === 'username') {
							endpoint = `/company/referrals/${attributeValue}?find_by=${findBy}`;
						} else {
							endpoint = `/company/referrals/${attributeValue}`;
						}
					}
					method = 'PUT';
					body = {
						promoter_campaign_id: this.getNodeParameter('promoterCampaignId', 0),
						'split_details[percentage]': this.getNodeParameter('splitDetailsPercentage', 0),
						'split_details[promoter_campaign_id]': this.getNodeParameter(
							'splitDetailsPromoterCampaignId',
							0,
						),
					};
					break;

				case 'move':
					{
						const idsParam = this.getNodeParameter('referralIds', 0);
						let ids = [];
						if (Array.isArray(idsParam)) {
							if (idsParam.length == 1) {
								ids = idsParam[0].toString().split(',').map(Number);
								//console.log("move if ids: ", ids);
							} else {
								ids = idsParam;
								//console.log("move else ids: " , ids);
							}
						}
						endpoint = '/company/referrals/move_to_promoter';
						method = 'POST';
						body = {
							promoter_campaign_id: this.getNodeParameter('promoterCampaignId', 0),
							ids: ids,
						};
					}
					break;

				case 'delete':
					{
						const idsParam = this.getNodeParameter('ids', 0);
						// const ids = Array.isArray(idsParam) ? idsParam : idsParam ? [idsParam] : [];
						let ids = [];
						if (Array.isArray(idsParam)) {
							if (idsParam.length == 1) {
								ids = idsParam[0].toString().split(',').map(Number);
								//console.log("if ids: ", ids);
							} else {
								ids = idsParam;
								//console.log("else ids: " , ids);
							}
						}

						body = { ids };
						endpoint = `/company/referrals`;
						method = 'DELETE';
					}
					break;
			}
		}
        else if (resource === 'tracking') {
			if (['sale', 'refund', 'cancellation'].includes(operation)) {
				const email = (this.getNodeParameter('email', 0) as string)?.trim() || '';
				const uid = (this.getNodeParameter('uid', 0) as string)?.trim() || '';
				if (!email && !uid) {
					throw new NodeOperationError(
						this.getNode(),
						`When tracking a ${operation}, either Email or UID is required.`,
					);
				}
			}
			switch (operation) {
				case 'signup':
					endpoint = '/track/signup';
					method = 'POST';
					body = {
						email: this.getNodeParameter('email', 0),
						uid: this.getNodeParameter('uid', 0),
						tid: this.getNodeParameter('tid', 0),
						ref_id: this.getNodeParameter('ref_id', 0),
						ip: this.getNodeParameter('ip', 0),
						created_at: this.getNodeParameter('created_at', 0),
						skip_email_notification: this.getNodeParameter('skip_email_notification', 0),
					};
					break;
				case 'sale':
					endpoint = '/track/sale';
					method = 'POST';
					body = {
						email: this.getNodeParameter('email', 0),
						uid: this.getNodeParameter('uid', 0),
						amount: this.getNodeParameter('amount', 0),
						event_id: this.getNodeParameter('event_id', 0),
						currency: this.getNodeParameter('currency', 0),
						tid: this.getNodeParameter('tid', 0),
						ref_id: this.getNodeParameter('ref_id', 0),
						quantity: this.getNodeParameter('quantity', 0),
						promo_code: this.getNodeParameter('promo_code', 0),
						plan: this.getNodeParameter('plan', 0),
						mrr: this.getNodeParameter('mrr', 0),
						skip_email_notification: this.getNodeParameter('skip_email_notification', 0),
					};
					break;
				case 'refund':
					endpoint = '/track/refund';
					method = 'POST';
					body = {
						email: this.getNodeParameter('email', 0),
						uid: this.getNodeParameter('uid', 0),
						amount: this.getNodeParameter('amount', 0),
						event_id: this.getNodeParameter('event_id', 0),
						currency: this.getNodeParameter('currency', 0),
						sale_event_id: this.getNodeParameter('sale_event_id', 0),
						quantity: this.getNodeParameter('quantity', 0),
					};
					break;
				case 'cancellation':
					endpoint = '/track/cancellation';
					method = 'POST';
					body = {
						email: this.getNodeParameter('email', 0),
						uid: this.getNodeParameter('uid', 0),
					};
					break;
			}
		}

		else if (resource === 'commissions') {
			switch (operation) {
				case 'list commissions':
					{
						qs = {
							q: this.getNodeParameter('searchByAttributeValue', 0),
							page: this.getNodeParameter('page', 0, 1),
							per_page: this.getNodeParameter('perPage', 0, 25),
						}
					}
					endpoint = '/company/commissions';
					method = 'GET';

					break;
				case 'create commission':
					endpoint = '/company/commissions';
					method = 'POST';
					body = {
						commission_type: 'sale',
						referral_id: this.getNodeParameter('referralId', 0),
						sale_amount:  this.getNodeParameter('saleAmount', 0),
						plan_id:  this.getNodeParameter('planId', 0),
						event_id:  this.getNodeParameter('eventId', 0),
						event_date:  this.getNodeParameter('eventDate', 0),
						internal_note:  this.getNodeParameter('internalNote', 0),
						external_note: this.getNodeParameter('externalNote', 0),
						notify_promoter:  this.getNodeParameter('notifyPromoter', 0),
						billing_period:  this.getNodeParameter('billingPeriod', 0),
					};
					break;
				case 'create custom commission': 
					endpoint = '/company/commissions';
					method = 'POST';
					body = {
						commission_type: 'custom',
						amount: this.getNodeParameter('amount', 0),
						promoter_campaign_id: this.getNodeParameter('promoterCampaignId', 0),
						unit: this.getNodeParameter('unit', 0),
						event_date: this.getNodeParameter('eventDate', 0),
						internal_note: this.getNodeParameter('internalNote', 0),
						external_note: this.getNodeParameter('externalNote', 0),
						notify_promoter: this.getNodeParameter('notifyPromoter', 0),
					};
					break;
                
				case 'update commission':
					endpoint = `/company/commissions/${this.getNodeParameter('commissionId', 0)}`;
					method = 'PUT';
					body = { 
						internal_note: this.getNodeParameter('commissionInternalNote', 0),
						external_note: this.getNodeParameter('commissionExternalNote', 0),
					};
					break;
				case 'approve commissions': 
					endpoint = '/company/commissions/approve';
					method = 'POST'; 
					{
						const idsParam = this.getNodeParameter('commissionIDs', 0);
						let ids = [];
						if (Array.isArray(idsParam)) {
							if (idsParam.length == 1) {
								ids = idsParam[0].toString().split(',').map(Number);
							} else {
								ids = idsParam;
							}
						}
						body = { ids };
					} 
					break;
				case 'deny commissions': 
					endpoint = '/company/commissions/deny';
					method = 'POST'; 
					{
						const idsParam = this.getNodeParameter('commissionIDs', 0);
						let ids = [];
						if (Array.isArray(idsParam)) {
							if (idsParam.length == 1) {
								ids = idsParam[0].toString().split(',').map(Number);
							} else {
								ids = idsParam;
							}
						}
						body = { ids };
					} 
					break;
				case 'mark commission fulfilled': 
					endpoint = '/company/commissions/mark_fulfilled';
					method = 'POST';
					{
						const idsParam = this.getNodeParameter('commissionIDs', 0);
						let ids = [];
						if (Array.isArray(idsParam)) {
							if (idsParam.length == 1) {
								ids = idsParam[0].toString().split(',').map(Number);
							} else {
								ids = idsParam;
							}
						}
						body = { ids };
					} 
					break;
				case 'mark commission unfulfilled':	
					endpoint = '/company/commissions/mark_unfulfilled';
					method = 'POST'; 
					{
						const idsParam = this.getNodeParameter('commissionIDs', 0);
						let ids = [];
						if (Array.isArray(idsParam)) {
							if (idsParam.length == 1) {
								ids = idsParam[0].toString().split(',').map(Number);
							} else {
								ids = idsParam;
							}
						}
						body = { ids };
					}
					break;
			}
		}

		else if (resource === 'promoters') {
				switch (operation) {
					case 'list promoters':
						endpoint = '/company/promoters';
						method = 'GET';
						qs = {
							page: this.getNodeParameter('page', 0, 1),
							per_page: this.getNodeParameter('perPage', 0, 20),
						};
						break;
					case  'get promoter':
						{
							const findBy = this.getNodeParameter('findPromoterBy', 0) as string;
							const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
							if (findBy === 'id') {
								endpoint = `/company/promoters/${attributeValue}`;
							} else {
								endpoint = `/company/promoters/${attributeValue}?find_by=${findBy}`;
							}
						}
						method = 'GET';
						break;
					case 'create promoter':
						{
							endpoint = '/company/promoters';
							method = 'POST';
							
							body = {
								email: this.getNodeParameter('promoterEmail', 0),
								cust_id: this.getNodeParameter('promoterCustId', 0),
								profile: {
									first_name: this.getNodeParameter('promoterFirstName', 0),
									last_name: this.getNodeParameter('promoterLastName', 0),
									website: this.getNodeParameter('promoterWebsite', 0),
									company_name: this.getNodeParameter('promoterCompanyName', 0),
									company_number: this.getNodeParameter('promoterCompanyNumber', 0),
									phone_number: this.getNodeParameter('promoterPhoneNumber', 0),
									vat_id: this.getNodeParameter('promoterVatId', 0),
									country: this.getNodeParameter('promoterCountry', 0),
									address: this.getNodeParameter('promoterAddress', 0),
									avatar: this.getNodeParameter('promoterAvatar', 0),
									w8_form_url: this.getNodeParameter('promoterW8FormUrl', 0),
									w9_form_url: this.getNodeParameter('promoterW9FormUrl', 0),
									description: this.getNodeParameter('promoterDescription', 0),
									instagram_url: this.getNodeParameter('promoterInstagramUrl', 0),
									youtube_url: this.getNodeParameter('promoterYouTubeUrl', 0),
									linkedin_url: this.getNodeParameter('promoterLinkedinUrl', 0),
									facebook_url: this.getNodeParameter('promoterFacebookUrl', 0),
									twitter_url: this.getNodeParameter('promoterTwitterUrl', 0),
									twitch_url: this.getNodeParameter('promoterTwitchUrl', 0),
									tiktok_url: this.getNodeParameter('promoterTiktokUrl', 0),
								},
								initial_campaign_id: this.getNodeParameter('promoterInitialCampaignId', 0),
								drip_emails: this.getNodeParameter('promoterDripEmails', 0),
							};
						}
						break;
					case 'update promoter':
						{
							endpoint = `/company/promoters/${this.getNodeParameter('attributeValue', 0)}`;
							method = 'PUT';
							const customFieldsUpdate = buildCustomFields(
								this.getNodeParameter('promoterCustomFields', 0, {}) as IDataObject,
							);
							body = {
								cust_id: this.getNodeParameter('promoterCustId', 0),
								find_by: this.getNodeParameter('findPromoterBy', 0),
								profile: {
									first_name: this.getNodeParameter('promoterFirstName', 0),
									last_name: this.getNodeParameter('promoterLastName', 0),
									website: this.getNodeParameter('promoterWebsite', 0),
									company_name: this.getNodeParameter('promoterCompanyName', 0),
									company_number: this.getNodeParameter('promoterCompanyNumber', 0),
									phone_number: this.getNodeParameter('promoterPhoneNumber', 0),
									vat_id: this.getNodeParameter('promoterVatId', 0),
									country: this.getNodeParameter('promoterCountry', 0),
									address: this.getNodeParameter('promoterAddress', 0),
									avatar: this.getNodeParameter('promoterAvatar', 0),
									w8_form_url: this.getNodeParameter('promoterW8FormUrl', 0),
									w9_form_url: this.getNodeParameter('promoterW9FormUrl', 0),
									description: this.getNodeParameter('promoterDescription', 0),
									instagram_url: this.getNodeParameter('promoterInstagramUrl', 0),
									youtube_url: this.getNodeParameter('promoterYouTubeUrl', 0),
									linkedin_url: this.getNodeParameter('promoterLinkedinUrl', 0),
									facebook_url: this.getNodeParameter('promoterFacebookUrl', 0),
									twitter_url: this.getNodeParameter('promoterTwitterUrl', 0),
									twitch_url: this.getNodeParameter('promoterTwitchUrl', 0),
									tiktok_url: this.getNodeParameter('promoterTiktokUrl', 0),
								},
								'profile[_destroy_w9form]': this.getNodeParameter('profile_destroy_w9form', 0, false),
								'profile[_destroy_w8form]': this.getNodeParameter('profile_destroy_w8form', 0, false),
							};
							if (customFieldsUpdate) (body as IDataObject).custom_fields = customFieldsUpdate;
						}
						break;
					case 'assign parent':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/assign parent';
							method = 'POST';
							body = {
								parent_promoter_id: this.getNodeParameter('parentPromoterId', 0),
								ids: ids,
							};
						}
						break;
					case 'move promoters':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/move_to_campaign';
							method = 'POST';
							body = {
								from_campaign_id: this.getNodeParameter('fromCampaignId', 0),
								to_campaign_id: this.getNodeParameter('toCampaignId', 0),
								ids: ids,
								drip_emails: this.getNodeParameter('dripEmails', 0),
								soft_move_referrals: this.getNodeParameter('softMoveReferrals', 0),
							};
						}
						break;
					case 'add promoters':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/add_to_campaign';
							method = 'POST';
							body = {
								campaign_id: this.getNodeParameter('campaignId', 0),
								ids: ids,
								drip_emails: this.getNodeParameter('dripEmails', 0),
							};
						}
						break;
					case 'accept':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/accept';
							method = 'POST';
							body = {
								campaign_id: this.getNodeParameter('campaignId', 0),
								ids: ids,
							};
						}
						break;
					case 'reject':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/reject';
							method = 'POST';
							body = {
								campaign_id: this.getNodeParameter('campaignId', 0),
								ids: ids,
							};
						}
						break;
					case 'block':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/block';
							method = 'POST';
							body = {
								campaign_id: this.getNodeParameter('campaignId', 0),
								ids: ids,
							};
						}
						break;
					case 'archive':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/archive';
							method = 'POST';
							body = {
								ids: ids,
							};
						}
						break;
					case 'restore':
						{
							const idsParam = this.getNodeParameter('ids', 0);
							let ids = [];
							if (Array.isArray(idsParam)) {
								if (idsParam.length == 1) {
									ids = idsParam[0].toString().split(',').map(Number);
									//console.log("move if ids: ", ids);
								} else {
									ids = idsParam;
									//console.log("move else ids: " , ids);
								}
							}
							endpoint = '/company/promoters/restore';
							method = 'POST';
							body = {
								ids: ids,
							};
						}
						break;

		}
		}

		else if (resource === 'promo codes') {
			switch (operation) {
				case 'archive promo code by id':
					{
						endpoint = `/company/promo_codes/${this.getNodeParameter('promoCodeId', 0)}`;
						method = 'DELETE';
					}
					break;

				case 'create promo code':
				{
					endpoint = '/company/promo_codes';
					method = 'POST';
					body = {
					code: this.getNodeParameter('promoCode', 0),
					reward_id: this.getNodeParameter('rewardId', 0),
					promoter_campaign_id: this.getNodeParameter('promoterCampaignId', 0),
					description: this.getNodeParameter('description', 0),
					metadata: this.getNodeParameter('metadata', 0),
					details: this.getNodeParameter('details', 0),
					};
				}
				break;   

				case 'get promo code by id':
				{
					endpoint = `/company/promo_codes/${this.getNodeParameter('promoCodeId', 0)}`;
					method = 'GET';
				}
				break;

				case 'get promo codes':
				{
					endpoint = '/company/promo_codes';
					method = 'GET';
				}
				break;

				case 'update promo code by id':
			{
				endpoint = `/company/promo_codes/${this.getNodeParameter('promoCodeId', 0)}`;
				method = 'PUT';
				body = {
				code: this.getNodeParameter('promoCode', 0),
				promoter_campaign_id: this.getNodeParameter('promoterCampaignId', 0),
				description: this.getNodeParameter('description', 0),
				metadata: this.getNodeParameter('metadata', 0),
				details: this.getNodeParameter('details', 0),
				};
			}
			break;
				
		}
		}

		else if (resource === 'custom') {
			if (['api'].includes(operation)) {
				const urlPath = (this.getNodeParameter('urlPath', 0) as string)?.trim() || '';
				if (urlPath === '') {
					throw new NodeOperationError(
						this.getNode(),
						`When performing a custom FirstPromoter ${operation.toUpperCase()} action, the 'URL Path' is required.`,
					);
				}
			}


			switch (operation) {
				case 'api':
				{
						const queryStringParameters = this.getNodeParameter('queryStringParameters', 0, {}) as IDataObject;
						if(Object.keys(queryStringParameters).length > 0 && queryStringParameters.queryParameters && Array.isArray(queryStringParameters.queryParameters)) {
							for (let index = 0; index < queryStringParameters.queryParameters.length; index++) {
								const queryParameter = queryStringParameters.queryParameters[index];
								qs[queryParameter.parameterName] = queryParameter.parameterValue as string;
							}
						}
						const headersParams = this.getNodeParameter('headersParams', 0, {}) as IDataObject;
						if(Object.keys(headersParams).length > 0 && headersParams.headerParameters && Array.isArray(headersParams.headerParameters)) {
							for (let index = 0; index < headersParams.headerParameters.length; index++) {
								const headerParameter = headersParams.headerParameters[index];
								headers[headerParameter.parameterName] = headerParameter.parameterValue as string;
							}
						}
						endpoint = (this.getNodeParameter('urlPath', 0) as string).replace('https://api.firstpromoter.com/api/v2', '');
						method = (this.getNodeParameter('method', 0) as string).toUpperCase() as IHttpRequestMethods;
						const bodyParam = this.getNodeParameter('body', 0, {}) as IDataObject | string;
						if (typeof bodyParam === 'string') {
						const normalized = bodyParam.trim().replace(/^\s*\{\s*\}\s*$/, '{}');
						body = (normalized === '{}' ? {} : JSON.parse(normalized)) as IDataObject;
						} else {
						body = bodyParam ?? {};
						}
				}
				break;
			}
		}
		else {
			throw new NodeApiError(this.getNode(), {
				message: `${resource} not in Firstpromoter resource list`,
				description: "This resource might have been added by the built-in tools",
			});
		}

		// makking API call to FirstPromoter API
	
		try {
				const cleanBody = omitEmpty(body);
				const cleanQs = omitEmpty(qs);
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'firstPromoterVersion2Api', {
					method,
					url: `https://api.firstpromoter.com/api/v2${endpoint}`,
					headers: {...headers},
					qs: Object.keys(cleanQs).length ? cleanQs : undefined,
					body: Object.keys(cleanBody).length ? cleanBody : undefined,
					json: true,
				});
			
				return [this.helpers.returnJsonArray(response.error || response )];
		} catch (error) {
				if (error.httpCode === "401") {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: "Authentication failed",
						description: "Please check your credentials and ensure you have provided the v2 API key and try again",
					});
				}
				
				const message =
					error && typeof error === 'object' && 'context' in error && 'data' in error.context
					? String(
						(error as { context?: { data?: { error: string} } } ).context?.data?.error || (error as { context?: { data?: { error: string, message: string} } } ).context?.data?.message ||  JSON.stringify((error as { context?: { data?: object }} ).context?.data) ||  (error as { description?: string } )?.description, 
					)
					: (error as { description?: string } )?.description;
				throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: `FirstPromoter API request failed with error code ${error.httpCode}`,
				description: `Failure Reason:  ${message || (error as Error).message}`
				});
		}
		
	}
}

