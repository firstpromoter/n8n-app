import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	IHttpRequestMethods,
	NodeOperationError,
	NodeApiError,
	JsonObject,
	NodeConnectionTypes,
} from 'n8n-workflow';


import { omitEmpty } from '../helper/utils';

export class FirstPromoterLegacy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FirstPromoter (Legacy) v1',
		icon: 'file:../../icons/firstpromoter.svg',
		name: 'firstPromoterLegacy',
		group: ['transform'],
		version: 1,
		description: 'Interact with FirstPromoter (Legacy) v1 API',
		usableAsTool: true,
		defaults: { name: 'FirstPromoter (Legacy) v1' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'firstPromoterLegacyApi', required: true,  }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Custom FirstPromoter API Call', value: 'custom' },
					{ name: 'Lead/Customer', value: 'lead' },
					{ name: 'Promoter', value: 'promoter' },
					{ name: 'Reward', value: 'reward' },
					{ name: 'Tracking', value: 'tracking' },
				],
				default: 'lead',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['lead'] },
				},
				options: [
					{ name: 'List Leads/Customers', value: 'list leads/customers', action: 'List leads or customers' },
					{ name: 'Modify Lead/Customer', value: 'update lead/customer', action: 'Modify existing lead or customer'  },
					{ name: 'Show Lead/Customer Details', value: 'get lead/customer', action: 'Show a lead or customer details' },
				],
				default: 'list leads/customers',
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
					show: { resource: ['reward'] },
				},
				options: [
					{ name: 'Create Reward', value: 'create reward', action: 'Create a reward' },
					{ name: 'List Rewards', value: 'list rewards', action: 'List rewards' },
					{ name: 'Update Reward', value: 'update reward', action: 'Update a reward' },
				],
				default: 'list rewards',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['promoter'] },
				},
				options: [
					{
						name: 'Add Promoters to Campaign',
						value: 'add promoter',
						action: 'Add promoters to a campaign',
					},
					{ name: 'Create Promoter', value: 'create', action: 'Create a promoter' },
				
					{ name: 'List Promoters', value: 'list', action: 'List promoters' },
					{ name: 'Modify Existing Promoter', value: 'update', action: 'Modify existing promoter' },
					{
						name: 'Move Promoter to Another Campaign',
						value: 'move promoter',
						action: 'Move a promoter to another campaign',
					},
					{ name: 'Reset Promoter Authentication Token', value: 'refresh token', action: 'Reset a promoter authentication token' },
					{ name: 'Show Promoter Details and Balance', value: 'get', action: 'Show promoter details and balance' },
					
				],
				default: 'list',
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
					{ name: 'Make FirstPromoter API Call', value: 'api', action: 'Make a custom v1 API call' },
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
			{
				displayName: "Promoter Email",
				name: 'promoter_email',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: "Email of the promoter",
			},
			{
				displayName: 'Created At',
				name: 'created_at',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['tracking'],
						operation: ['signup'],
					},
				},
				description: 'ISO date string of the date of the signup event',
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
				hint: `The sale amount in cents. It's used to calculate commissions/rewards.<br/>
For zero-decimal currencies like JPY, amount and mrr parameters should be sent as whole values.<br/>
For other currencies, amount and mrr parameter values should be in cents, i.e., you will need to multiply the value by 100 before sending the request.`,
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

			// Lead/Customer parameters would go here...
			// Get Lead/customer details parameters would go here...
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
				],
				default: 'id', // 'id', 'uid', 'email'
				description: 'Find a lead/customer by its ID, Email, UID',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['get lead/customer'],
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
						resource: ['lead'],
						operation: ['get lead/customer'],
					},
				},
				description:
					'The value of the attribute to find the referral by. For example, the ID, UID, Email of the referral.',
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
				],
				default: 'id', // 'id', 'email', 'uid'
				description: 'Find a referral to update by its ID, Email, UID',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
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
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description:
					'The value of the attribute to find the referral by. For example, the ID of the referral, UID of the referral, email of the referral, or username of the referral.',
			},
			{
				displayName: 'New UID',
				name: 'newUid',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description: 'New uid of the lead or customer',
			},
			{
				displayName: 'New Email',
				name: 'newEmail',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description: 'New email of the lead or customer',
			},
			{
				displayName: 'New Ref ID',
				name: 'newRefId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description: 'If you want to move the referral (lead or customer) to another promoter, you can enter the referral ID of the new promotion',
			},
			{
				displayName: 'Soft Switch',
				name: 'softSwitch',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description: 'Whether to move only the referral (lead or customer) to another promoter. NB: if set to true, the rewards/commissions associated with the referral will not be moved.',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: '', value: '' },
					{ name: 'Active', value: 'active' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Denied', value: 'denied' },
					{ name: 'Signup', value: 'signup' },
					{ name: 'Subscribed', value: 'subscribed' },
				],
				default: '', // 'id', 'uid', 'email'
				description: 'Lead\'s state. Available options: `signup`, `active`, `subscribed`, `denied`, `cancelled`.',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
			},
			{
				displayName: 'Customer Since',
				name: 'customerSince',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description: 'ISO datetime when the lead was converted to a customer',
			},
			{
				displayName: 'Plan Name',
				name: 'planName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['update lead/customer'],
					},
				},
				description: 'ID of the plan the customer was assigned to. Needs to match with the plans set on FirstPromoter.',
			},


			// delete referral parameters would go here...
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
				],
				default: 'id', // 'id', 'uid', 'email'
				description: 'Find a lead/customer to delete by its ID, Email, UID',
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['delete lead/customer'],
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
						resource: ['lead'],
						operation: ['delete lead/customer'],
					},
				},
				description:
					'The value of the attribute to find the lead/customer by. For example, the ID or email or UId of the lead/customer.',
			},
			
			
			// List Promoters parameters would go here...
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['list'],
					},
				},
				description: 'ID of the campaign to list accepted promoters from',
			},


			// get/show promoter details and balance parameters would go here...
			{
				displayName: 'Find by Attribute',
				name: 'findPromoterBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Auth Token', value: 'auth_token' },
					{ name: 'Cust ID', value: 'cust_id' },
					{ name: 'ID', value: 'id' },
					{ name: 'Promoter Email', value: 'promoter_email' },
					{ name: 'Referral ID', value: 'ref_id' },
				],
				default: 'id', // 'auth_token', 'email', 'id', 'promo_code', 'ref_token'
				description: 'Find a promoter by its Auth Token, Cust ID, ID, Email or Referral ID attribute',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['get', ''],
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
						resource: ['promoter'],
						operation: ['get'],
					},
				},
				description:
					'The value of the attribute to find the promoter by. For example, the Auth Token, Cust ID, Email, ID, or Referral ID of the promoter.',
			},

			// update promoter parameters would go here...
			{
				displayName: 'Find Promoter To Move By',
				name: 'findPromoterBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Auth Token', value: 'auth_token' },
					{ name: 'Cust ID', value: 'cust_id' },
					{ name: 'ID', value: 'id' },
					{ name: 'Promoter Email', value: 'promoter_email' },
					{ name: 'Referral ID', value: 'ref_id' },
				],
				default: 'id',
				description: 'Find a promoter by its Auth Token, Cust ID, ID, Email or Referral ID attribute',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['update', 'move promoter', 'add promoter'],
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
						resource: ['promoter'],
						operation: ['update', 'move promoter', 'add promoter'],
					},
				},
				description:
					'The value of the attribute to find the promoter by. For example, the Auth Token, Cust ID, Email, ID, or Referral ID of the promoter.',
			},

			// update promoter parameters would go here...

			{
				displayName: 'First Name',
				name: 'promoterFirstName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['update'],
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
						resource: ['promoter'],
						operation: ['create'],
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
						resource: ['promoter'],
						operation: ['create'],
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
						resource: ['promoter'],
						operation: ['create', 'update'],
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
						resource: ['promoter'],
						operation: ['create',],
					},
				},
				description:
					"Cust ID of the promoter. This is the customer's user ID inside your application/system used to identify the promoter. It will be avaliable in the webhooks to identify the promoter in your system if you subscribe for FirstPromoter webhooks.",
			},
			{
				displayName: 'Referral ID/Token',
				name: 'promoterRefId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create',],
					},
				},
				description:
					'Referral Token/ID. If this is blank an ID is assigned based on the first name. Can be only lower-case letters , numbers , -(hyphen) and _(underscore). This is also know as `Ref_ID`',
			},
			{
				displayName: 'Campaign ID',
				name: 'promoterCampaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'The ID of the campaign to assign the promoter to. On the campaigns sections you can see the ID as camp_id query parameter on \'Promoter Sign Up page URL\'. If there is no camp_id it means the campaign is the default campaign and this parameter is not required.',
			},
			{
				displayName: 'Promo Code',
				name: 'promoterPromoCode',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'Unique promo code from your billing provider to assign to this affiliate for coupon tracking. This is also known as the `Coupon Code` or `Coupon ID`.',
			},
			{
				displayName: 'Customer Promo Code',
				name: 'promoterCustomerPromoCode',
				type: 'string',
				default: '',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'Customer promo code from your billing provider to assign to this affiliate for coupon tracking. This is also known as `discount code` or `promotion code` or `display code`. This is the code your customer(s) can use on the checkout form/page.',
			},
			{
				displayName: 'Temporary Password',
				name: 'promoterTempPassword',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
			
				description: 'A temporary password promoters can use to log in to their dashboard if you don\'t use authentication tokens(auth_token) to sign promoters in automatically',
			},
			{
				displayName: 'Landing Page URL',
				name: 'promoterLandingUrl',
				type: 'string',
				noDataExpression: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
			
				description: 'You can set up a custom landing page URL for this promoter. The referral ID will be appended to it, unless the `Enable Direct URL Tracking` parameter(below) is used.',
			},
			{
				displayName: 'Enable Direct URL Tracking',
				name: 'promoterUrlTracking',
				type: 'boolean',
				noDataExpression: false,
				default: false,
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
			
				description: 'Whether to enable Direct URL tracking feature. FirstPromoter will do the tracking based on `Landing Page URL`(above) without requiring the referral ID to be appended to the URL. The `Landing Page URL` needs to be unique for each promoter. Default is false',
			},

			{
				displayName: 'Parent Promoter ID',
				name: 'promoterParentId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'ID of the parent promoter if you want this promoter to be a sub-affiliate',
			},
			{
				displayName: 'Parent Promoter Email',
				name: 'promoterParentEmail',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'Email of the parent promoter if you want this promoter to be a sub-affiliate',
			},
			{
				displayName: 'Skip Email Notification',
				name: 'promoterSkipEmailNotification',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'Whether to skip email notifications to promoter. Set this to `true` to skip email notifications. Default is false.',
			},
			{
				displayName: 'Auto Approve New Promoters',
				name: 'promoterAlwaysApprove',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'Whether to automatically approve the promoter into the campaign without having you manually review the promoter. Please note that this feature only works when `Auto approve new promoters` is enabled/toggled on your FirstPromoter Admin panel under the Campaign settings.',
			},
			{
				displayName: 'Website',
				name: 'promoterWebsite',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
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
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: 'Company name of the promoter',
			},
			{
				displayName: 'Phone Number',
				name: 'promoterPhoneNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: 'Phone number of the promoter',
			},
			{
				displayName: 'Paypal Email',
				name: 'promoterPaypalEmail',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: 'Promoter\'s Paypal email address',
			},
		
			{
				displayName: 'Country',
				name: 'promoterCountry',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
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
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: 'Address of the promoter',
			},
			{
				displayName: 'Avatar URL',
				name: 'promoterAvatar',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: "URL to the promoter's avatar image",
			},
			{
				displayName: 'Note/Description',
				name: 'promoterDescription',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: 'A note/description of promoter',
			},
			{
				displayName: 'YouTube URL',
				name: 'promoterYouTubeUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
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
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: "Promoter's LinkedIn URL if available",
			},
			{
				displayName: 'Instagram URL',
				name: 'promoterInstagramUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: "Promoter's Instagram URL if available",
			},
			{
				displayName: 'Facebook URL',
				name: 'promoterFacebookUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create', 'update'],
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
						resource: ['promoter'],
						operation: ['create', 'update'],
					},
				},
				description: "Promoter's Twitter URL if available",
			},
			{
				displayName: 'Created At',
				name: 'promoterCreatedAt',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['create'],
					},
				},
				description: 'ISO date string of the date of the signup event of the promoter',
			},

			// Get promoters list parameters would go here...
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['promoter', 'lead', 'reward'],
						operation: ['list', 'list leads/customers', 'list rewards'],
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
						resource: ['promoter'],
						operation: ['list'],
					},
				},
				description: 'Number of promoters to return per page',
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				default: 25,
				displayOptions: {
					show: {
						resource: ['lead'],
						operation: ['list leads/customers'],
					},
				},
				description: 'Number of leads and customers to return per page',
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				default: 25,
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['list rewards'],
					},
				},
				description: 'Number of rewards to return per page',
			},
			
			

			// move promoters to campaign parameters would go here..
			// .
			{
				displayName: 'From Campaign ID',
				name: 'fromCampaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['move promoter'],
					},
				},
				description: 'The ID of the campaign you want to move the promoters from. Only needed if the promoter is added to multiple campaigns. You can use this parameter to specify which campaign to change. If none is specified if will use as source the default campaign.',
			},
			{
				displayName: 'To Campaign ID',
				name: 'toCampaignId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['move promoter'],
					},
				},
				description: 'The ID of the campaign you want to move the promoters to',
			},
			
			
			// Reset promoters auth_token  parameters would go here...
			{
				displayName: 'Find by Attribute',
				name: 'findPromoterBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Auth Token', value: 'auth_token' },
					{ name: 'Cust ID', value: 'cust_id' },
					{ name: 'ID', value: 'id' },
					{ name: 'Promoter Email', value: 'promoter_email' },
					{ name: 'Referral ID/Token', value: 'ref_id' },
				],
				default: 'id', 
				description: 'Find a promoter by its Auth Token, Cust ID, Email, ID or Referral ID/Token',
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['refresh token'],
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
						resource: ['promoter'],
						operation: ['refresh token'],
					},
				},
				description:
					'The value of the attribute to find the promoter by. For example, the Auth Token, Email, ID, , or Referral ID/Token of the promoter.',
			},

			// add promoter to campaign
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['add promoter'],
					},
				},
				description: 'The ID of the campaign you want to add the promoters to',
			},
			{
				displayName: 'Skip Email Notification',
				name: 'skipEmailNotification',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['promoter'],
						operation: ['add promoter', 'move promoter'],
					}
				},
				description: 'Whether to skip email notification to promoter',
			},


			// Reward parameters would here...

			// Get reward parameter
			{
				displayName: 'Promotion ID',
				name: 'promotionId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['list rewards'],
					},
				},
				description: 'List all rewards and commissions assigned to this promotion ID',
			},
			{
				displayName: 'Referral ID (Ref ID)',
				name: 'refId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['list rewards'],
					},
				},
				description: 'List all rewards and commissions assigned to a promotion - find promotion by ref_id',
			},
			{
				displayName: 'Promoter ID',
				name: 'promoterId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['list rewards'],
					},
				},
				description: 'List all rewards and commissions assigned to a promoter',
			},
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['list rewards'],
					},
				},
				description: 'List all rewards and commissions available to a campaign',
			},




			// Create a reward
			{
				displayName: 'Find Promoter by Attribute',
				name: 'findPromoterBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: '', value: '' },
					{ name: 'Promotion ID', value: 'promotion_id' },
					{ name: 'Promotion Referral ID/Token', value: 'ref_id' },
				],
				default: '', 
				description: 'Find promoter by the Promotion ID or Referral ID of the promoter who owns the reward',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
			},
			{
				displayName: 'Promoter Attribute Value',
				name: 'attributeValueForPromoter',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
				description:
					'The value of the attribute to find the promoter by. The Promotion ID or Referral ID of the promoter who owns the reward.',
			},
			{
				displayName: 'Find Referral by Attribute',
				name: 'findReferralBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: '', value: '' },
					{ name: 'Email', value: 'email' },
					{ name: 'Lead ID', value: 'lead_id' },
					{ name: 'UID', value: 'uid' },
				],
				default: '', 
				description: 'Find the Lead\'s ID or Email or UID who generated the reward',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
			},
			{
				displayName: 'Referral Attribute Value',
				name: 'attributeValueForReferral',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
				description:
					'The value of the attribute to find the referral (lead/customer) by. The Lead\'s ID or Email or UID who generated the reward.',
			},
			{
				displayName: 'Reward Type',
				name: 'rewardType',
				type: 'options',
				default: '',
				required: true,
				displayOptions: {
					show: {
					resource: ['reward'],
					operation: ['create reward'],
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
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
				description: 'Amount of the reward. For reward_type cash(monetary commission) the amount is in cents.',
			},

			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: '', value: '' },
					{ name: 'Approved', value: 'approved' },
					{ name: 'Denied', value: 'denied' },
					{ name: 'Pending', value: 'pending' },
				],
				default: '', 
				description: 'Status can be `approved`(default if this param is omitted), `pending` or `denied`',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
			},
			{
				displayName: 'Skip Email Notification',
				name: 'skipEmailNotification',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['create reward'],
					},
				},
				description: 'Whether to skip email notification to promoter. Set this to \'true\' to skip email notifications. Default is \'false\'.',
			},


			// Update a reward

			{
				displayName: 'Find Reward/Commission by Attribute',
				name: 'findRewardBy',
				type: 'options',
				noDataExpression: true,
				required: true,
				options: [
					{ name: '', value: '' },
					{ name: 'Event ID', value: 'event_id' },
					{ name: 'Reward/Commission ID', value: 'id' },
				],
				default: '', 
				description: 'Find reward or commission by its ID or the ID of the event that generated the reward',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['update reward'],
					},
				},
			},
			{
				displayName: 'Reward/Commission Attribute Value',
				name: 'attributeValueForReward',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['update reward'],
					},
				},
				description:
					'The value of the attribute to find the reward/commission by. The reward/commission ID or the ID of the event that generated the reward.',
			},
			{
				displayName: 'New Status',
				name: 'status',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: '', value: '' },
					{ name: 'Approved', value: 'approved' },
					{ name: 'Denied', value: 'denied' },
					{ name: 'Pending', value: 'pending' },
				],
				default: '', 
				description: 'New status of the reward. Status can be `approved`(default if this param is omitted), `pending` or `denied`.',
				displayOptions: {
					show: {
						resource: ['reward'],
						operation: ['update reward'],
					},
				},
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
				description: 'The URL path of the endpoint. For example: `/promoters/list`. You don\'t need to add the base URL(https://firstpromoter.com/v1). You can find the available paths in the firstpromoter v1 API documentation.',
				placeholder: '/promoters/list',
			},
			{
				displayName: 'Method',
				name: 'method',
				type: 'options',
				default: 'GET',
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
				displayName: 'Query String Parameters',
				name: 'queryStringParameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Query Parameter',
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
								placeholder: 'Enter parameter name',
								description:'Name of the parameter',
							},
							{
								displayName: 'Value',
								name: 'parameterValue',
								type: 'string',
								default: '',
								placeholder: 'Enter parameter value',
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
								placeholder: 'Enter header name',
								description:'Name of the header parameter',
							},
							{
								displayName: 'Value',
								name: 'parameterValue',
								type: 'string',
								default: '',
								placeholder: 'Enter header value',
								description: 'Value for this header parameter name',
							},
						],
					},
				],
			}
		],
	};


	async execute(this: IExecuteFunctions) {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let endpoint = '';
		let method: IHttpRequestMethods = 'GET';
		//let body: IDataObject = {};
		let qs: IDataObject = {};
        const headers: IDataObject = {};


		if (resource === 'lead') {
			switch (operation) {
				case 'list leads/customers':
					endpoint = '/leads/list';
					method = 'GET';
					qs = {
						page: this.getNodeParameter('page', 0, 1),
						per_page: this.getNodeParameter('perPage', 0, 25),
					};
					break;
				case 'get lead/customer':
					{
						const findBy = this.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'id') {
							qs['id'] = attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
					}
					endpoint = '/leads/show'
					method = 'GET';
					break;

				case 'update lead/customer':
					{
						const findBy = this.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'id') {
							qs['id'] = attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
						qs['new_uid'] =  this.getNodeParameter('newUid', 0) as string;
						qs['new_email'] =  this.getNodeParameter('newEmail', 0) as string;
						qs['new_ref_id'] =  this.getNodeParameter('newRefId', 0) as string;
						qs['soft_switch'] =  this.getNodeParameter('softSwitch', 0) as boolean;
						qs['state'] =  this.getNodeParameter('state', 0) as string;
						qs['customer_since'] =  this.getNodeParameter('customerSince', 0) as string;
						qs['plan_name'] =  this.getNodeParameter('planName', 0) as string;
					}
					endpoint = '/leads/update'
					method = 'PUT';
					break;

				case 'delete lead/customer':
					{
						const findBy = this.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'id') {
							qs['id'] = attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
						endpoint = `/leads/delete`;
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
			if (['signup'].includes(operation)) {
				const tid = (this.getNodeParameter('tid', 0) as string)?.trim() || '';
				const refId = (this.getNodeParameter('ref_id', 0) as string)?.trim() || '';
				const promoterEmail = (this.getNodeParameter('promoter_email', 0) as string)?.trim() || '';
			
				if (!tid && !refId && !promoterEmail ) {
					throw new NodeOperationError(
						this.getNode(),
						`When tracking a ${operation}, either TID or Referral ID is required.`,
					);
				}
			}
			switch (operation) {
				case 'signup':
					endpoint = '/track/signup';
					method = 'POST';
					qs = {
						email: this.getNodeParameter('email', 0),
						uid: this.getNodeParameter('uid', 0),
						tid: this.getNodeParameter('tid', 0),
						ref_id: this.getNodeParameter('ref_id', 0),
						ip: this.getNodeParameter('ip', 0),
						promoter_email: this.getNodeParameter('promoter_email', 0),
						created_at: this.getNodeParameter('created_at', 0),
						skip_email_notification: this.getNodeParameter('skip_email_notification', 0),
					};
					break;
				case 'sale':
					endpoint = '/track/sale';
					method = 'POST';
					qs = {
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
					qs = {
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
					qs = {
						email: this.getNodeParameter('email', 0),
						uid: this.getNodeParameter('uid', 0),
					};
					break;
			}
		}

		else if (resource === 'reward') {
			switch (operation) {
				case 'list rewards':
					endpoint = '/rewards/list';
					method = 'GET';
					qs = {
						promotion_id:  this.getNodeParameter('promotionId', 0),
						promoter_id:  this.getNodeParameter('promoterId', 0),
						campaign_id:  this.getNodeParameter('campaignId', 0),
						ref_id:  this.getNodeParameter('refId', 0),
						page: this.getNodeParameter('page', 0, 1),
						per_page: this.getNodeParameter('perPage', 0, 20),
					};
					break;

				case 'create reward':
					endpoint = '/rewards/create';
					method = 'POST';
					{
						qs = {
							amount: this.getNodeParameter('amount', 0),
							status: this.getNodeParameter('status', 0),
							reward_type: this.getNodeParameter('rewardType', 0),
							skip_email_notification: this.getNodeParameter('skipEmailNotification', 0, false),
						};

						const findPromoterBy = this.getNodeParameter('findPromoterBy', 0) as string;
						const attributeValueForPromoter = this.getNodeParameter('attributeValueForPromoter', 0) as string;
						const findReferralBy = this.getNodeParameter('findReferralBy', 0) as string;
						const attributeValueForReferral = this.getNodeParameter('attributeValueForPromoter', 0) as string;
						
						if (findPromoterBy !== '') {
							qs[`${findPromoterBy}`] = attributeValueForPromoter;
						} 

						if (findReferralBy !== '') {
							qs[`${findReferralBy}`] = attributeValueForReferral;
						} 
					}
					break;

				case 'update reward':
					endpoint = '/rewards/update';
					method = 'PUT';
					{
						qs = { status: this.getNodeParameter('status', 0) }
						const findRewardBy = this.getNodeParameter('findRewardBy', 0) as string;
						const attributeValueForReward = this.getNodeParameter('attributeValueForReward', 0) as string;
						if (findRewardBy !== '') {
							qs[`${findRewardBy}`] = attributeValueForReward;
						} 
						
					}
					
					break;
				
			}
		}

		else if (resource === 'promoter') {
			switch (operation) {
				case 'list':
					endpoint = '/promoters/list';
					method = 'GET';
					qs = {
						campaign_id: this.getNodeParameter('campaignId', 0, 1),
						page: this.getNodeParameter('page', 0, 1),
						per_page: this.getNodeParameter('perPage', 0, 25),
					};
					break;
				case 'get':
					{
						const findBy = this.getNodeParameter('findPromoterBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'id') {
							qs['id'] = attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
					}
					endpoint = '/promoters/show';
					method = 'GET';
					break;
				case 'create':
					{
						endpoint = '/promoters/create';
						method = 'POST';
						qs = {
							email: this.getNodeParameter('promoterEmail', 0),
							first_name: this.getNodeParameter('promoterFirstName', 0),
							last_name: this.getNodeParameter('promoterLastName', 0),
							cust_id: this.getNodeParameter('promoterCustId', 0),
							ref_id: this.getNodeParameter('promoterRefId', 0),
							campaign_id: this.getNodeParameter('promoterCampaignId', 0),
							
							promo_code: this.getNodeParameter('promoterPromoCode', 0),
							customer_promo_code: this.getNodeParameter('promoterCustomerPromoCode', 0),
							temp_password: this.getNodeParameter('promoterTempPassword', 0),
							landing_url: this.getNodeParameter('promoterLandingUrl', 0),
							url_tracking: this.getNodeParameter('promoterUrlTracking', 0),
							website: this.getNodeParameter('promoterWebsite', 0),
							paypal_email: this.getNodeParameter('promoterPaypalEmail', 0),
							parent_promoter_id: this.getNodeParameter('promoterParentId', 0),
							parent_promoter_email: this.getNodeParameter('promoterParentEmail', 0),

							company_name: this.getNodeParameter('promoterCompanyName', 0),
							phone_number: this.getNodeParameter('promoterPhoneNumber', 0),
							
							country: this.getNodeParameter('promoterCountry', 0),
							address: this.getNodeParameter('promoterAddress', 0),
							avatar_url: this.getNodeParameter('promoterAvatar', 0),
							note: this.getNodeParameter('promoterDescription', 0),
							
							instagram_url: this.getNodeParameter('promoterInstagramUrl', 0),
							youtube_url: this.getNodeParameter('promoterYouTubeUrl', 0),
							linkedin_url: this.getNodeParameter('promoterLinkedinUrl', 0),
							facebook_url: this.getNodeParameter('promoterFacebookUrl', 0),
							twitter_url: this.getNodeParameter('promoterTwitterUrl', 0),
							
							created_at: this.getNodeParameter('promoterCreatedAt', 0),
							always_approve: this.getNodeParameter('promoterAlwaysApprove', 0, false),
							skip_email_notification: this.getNodeParameter('promoterSkipEmailNotification', 0, false),
							

						};
					}
					break;
				case 'update':
					{
						endpoint = '/promoters/update';
						method = 'PUT';
						qs = {
							email: this.getNodeParameter('promoterEmail', 0),
							first_name: this.getNodeParameter('promoterFirstName', 0),
							last_name: this.getNodeParameter('promoterLastName', 0),
							cust_id: this.getNodeParameter('promoterCustId', 0),
							ref_id: this.getNodeParameter('promoterRefId', 0),
							campaign_id: this.getNodeParameter('promoterCampaignId', 0),
							
							promo_code: this.getNodeParameter('promoterPromoCode', 0),
							customer_promo_code: this.getNodeParameter('promoterCustomerPromoCode', 0),
							temp_password: this.getNodeParameter('promoterTempPassword', 0),
							landing_url: this.getNodeParameter('promoterLandingUrl', 0),
							url_tracking: this.getNodeParameter('promoterUrlTracking', 0),
							website: this.getNodeParameter('promoterWebsite', 0),
							paypal_email: this.getNodeParameter('promoterPaypalEmail', 0),
							parent_promoter_id: this.getNodeParameter('promoterParentId', 0),
							parent_promoter_email: this.getNodeParameter('promoterParentEmail', 0),

							company_name: this.getNodeParameter('promoterCompanyName', 0),
							phone_number: this.getNodeParameter('promoterPhoneNumber', 0),
							
							country: this.getNodeParameter('promoterCountry', 0),
							address: this.getNodeParameter('promoterAddress', 0),
							avatar_url: this.getNodeParameter('promoterAvatar', 0),
							note: this.getNodeParameter('promoterDescription', 0),
							
							instagram_url: this.getNodeParameter('promoterInstagramUrl', 0),
							youtube_url: this.getNodeParameter('promoterYouTubeUrl', 0),
							linkedin_url: this.getNodeParameter('promoterLinkedinUrl', 0),
							facebook_url: this.getNodeParameter('promoterFacebookUrl', 0),
							twitter_url: this.getNodeParameter('promoterTwitterUrl', 0),
							
							// created_at: this.getNodeParameter('promoterCreatedAt', 0),
							// always_approve: this.getNodeParameter('promoterAlwaysApprove', 0, false),
							// skip_email_notification: this.getNodeParameter('promoterSkipEmailNotification', 0, false),
						};
						
					}
					break;
				case 'move promoter':
					{
						const findBy = this.getNodeParameter('findPromoterBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;
					
						endpoint = '/promoters/move_to_campaign';
						method = 'POST';
						qs = {
							source_campaign_id: this.getNodeParameter('fromCampaignId', 0),
							destination_campaign_id: this.getNodeParameter('toCampaignId', 0),
							skip_email_notification: this.getNodeParameter('skipEmailNotification', 0, false),
						};
						if (findBy === 'id') {
							qs['id'] =  attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
					}
					break;
				case 'add promoter':
					{
						const findBy = this.getNodeParameter('findPromoterBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;

						endpoint = '/promoters/add_to_campaign';
						method = 'POST';
						qs = {
							campaign_id: this.getNodeParameter('campaignId', 0),
							skip_email_notification: this.getNodeParameter('skipEmailNotification', 0, false),
						};
						if (findBy === 'id') {
							qs['id'] =  attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
					}
					break;
				case 'refresh token':
					{
						const findBy = this.getNodeParameter('findPromoterBy', 0) as string;
						const attributeValue = this.getNodeParameter('attributeValue', 0) as string;

						endpoint = '/promoters/refresh_token';
						method = 'PUT';
						if (findBy === 'id') {
							qs['id'] =  attributeValue;
						} else {
							qs[`${findBy}`] = `${attributeValue}`;
						}
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
					endpoint = (this.getNodeParameter('urlPath', 0) as string).replace('https://firstpromoter.com/api/v1', '');
					method = (this.getNodeParameter('method', 0) as string).toUpperCase() as IHttpRequestMethods;
				}
				break;
			}
		}
		else{
			throw new NodeApiError(this.getNode(), {
				message: `${resource} not in Firstpromoter resource list`,
				description: "This resource might have been added by the built-in tools",
			});
		}
		
		// making API call to FirstPromoter API
		try {
			const cleanQs = omitEmpty(qs);
			const response = await this.helpers.httpRequestWithAuthentication.call( this,'firstPromoterLegacyApi', {
				method,
				url: `https://firstpromoter.com/api/v1${endpoint}`,
				headers: {...headers},
				qs: Object.keys(cleanQs).length ? cleanQs : undefined,
				json: true,
			});

			return [this.helpers.returnJsonArray(response)];
		} catch (error) {
			
			if (error.httpCode === "401") {
				throw new NodeApiError(this.getNode(), error as JsonObject, {
					message: "Authentication failed",
					description: "Please check your credentials and ensure you have provided the v1 (legacy) API key and try again",
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
