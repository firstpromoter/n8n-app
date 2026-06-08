import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionTypes,
	IHookFunctions,
	INodePropertyOptions,
	ILoadOptionsFunctions,
	NodeOperationError,
} from 'n8n-workflow';

import {
	fetchWebhooks,
	createWebHook,
	deleteWebhook,
	getSelectedEventTypes,
	getCampaigns,
	toTitleCase,
	getErrorDescription,
} from './GeneralFunctions';

export class FirstPromoterTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FirstPromoter Trigger',
		icon: {
			light: 'file:../../icons/firstpromoter.svg',
			dark: 'file:../../icons/firstpromoter.dark.svg',
		},
		name: 'firstPromoterTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Triggers n8n workflow when an event is recevied from FirstPromoter.',
		usableAsTool: true,
		defaults: { name: 'FirstPromoter Trigger' },
		inputs: [],
		credentials: [{ name: 'firstPromoterApi', required: true }],
		outputs: [NodeConnectionTypes.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'receive',
			},
		],
		properties: [
			{
				displayName:
					"The webhook URL is automatically registered on FirstPromoter. To send a test event, click 'Test this trigger' or 'Execute step', go to your FirstPromoter Settings > Integrations > Webhooks section, click the edit icon next to your corresponding Test or Production URL, In the 'Test webhook' section, click 'Select event' and then select your desired event, and click 'Run Test'.",
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Event Types Category',
				name: 'eventTypesCategory',
				type: 'options',
				required: true,
				options: [
					{ name: 'All Categories', value: 'all' },
					{ name: 'Commission', value: 'commission' },
					{ name: 'Contract Document', value: 'contract_document' },
					{ name: 'Payments Batch', value: 'payments_batch' },
					{ name: 'Payout', value: 'payout' },
					{ name: 'Payout Method', value: 'payout_method' },
					{ name: 'Promoter', value: 'promoter' },
					{ name: 'Promoter Campaign', value: 'promoter_campaign' },
					{ name: 'Referral', value: 'referral' },
				],
				default: 'all',
			},
			{
				displayName: 'Campaign Names or IDs',
				name: 'campaignIds',
				type: 'multiOptions',
				required: true,
				description:
					'Select the campaigns to listen for events. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				typeOptions: {
					loadOptionsMethod: 'getCampaigns',
					loadOptionsDependsOn: ['firstPromoterApi'],
				},
				default: [],
			},
			{
				displayName: 'Commission Event Types',
				name: 'commissionEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['commission', 'all'],
					},
				},
				options: [
					{
						name: 'Commission Approved',
						value: 'commission.approved',
						description: 'Triggers when a commission is approved',
					},
					{
						name: 'Commission Created',
						value: 'commission.created',
						description: 'Triggers when a new commission record is created',
					},
					{
						name: 'Commission Deleted',
						value: 'commission.deleted',
						description: 'Triggers when a commission record is deleted',
					},
					{
						name: 'Commission Denied',
						value: 'commission.denied',
						description: 'Triggers when a commission is denied',
					},
					{
						name: 'Commission Pending',
						value: 'commission.pending',
						description: 'Triggers when a commission is pending',
					},
					{
						name: 'Commission Updated',
						value: 'commission.updated',
						description: 'Triggers when a commission record is updated',
					},
				],
				default: [],
			},
			{
				displayName: 'Contract Document Event Types',
				name: 'contractDocumentEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['contract_document', 'all'],
					},
				},
				options: [
					{
						name: 'Contract Document Signed',
						value: 'contract_document.signed',
						description: 'Triggers when a promoter signed a contract document',
					},
				],
				default: [],
			},
			{
				displayName: 'Payments Batch Event Types',
				name: 'paymentsBatchEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['payments_batch', 'all'],
					},
				},
				options: [
					{
						name: 'Payments Batch Created',
						value: 'payments_batch.created',
						description: 'Triggers when a payment batch is deleted',
					},
					{
						name: 'Payments Batch Updated',
						value: 'payments_batch.updated',
						description: 'Triggers when a payment batch is updated',
					},
					{
						name: 'Payments Batch Deleted',
						value: 'payments_batch.deleted',
						description: 'Triggers when a payment batch is deleted',
					},
				],
				default: [],
			},
			{
				displayName: 'Payout Events',
				name: 'payoutEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['payout', 'all'],
					},
				},
				options: [
					{
						name: 'Payout Cancelled',
						value: 'payout.cancelled',
						description: 'Triggers when a payout is cancelled',
					},
					{
						name: 'Payout Commissions Added',
						value: 'payout.commissions.added',
						description: 'Triggers when a commission record is added to a payout',
					},
					{
						name: 'Payout Commissions Removed',
						value: 'payout.commissions.removed',
						description: 'Triggers when a commission record is removed from a payout',
					},
					{
						name: 'Payout Completed',
						value: 'payout.completed',
						description: 'Triggers when a payout is completed',
					},
					{
						name: 'Payout Created',
						value: 'payout.created',
						description: 'Triggers when a payout is created',
					},
					{
						name: 'Payout Deleted',
						value: 'payout.deleted',
						description: 'Triggers when a payout is deleted',
					},
					{
						name: 'Payout Failed',
						value: 'payout.failed',
						description: 'Triggers when a payout has failed',
					},
					{
						name: 'Payout Pending',
						value: 'payout.pending',
						description: 'Triggers when a payout is pending',
					},
					{
						name: 'Payout Processing',
						value: 'payout.processing',
						description: 'Triggers when processing a payout',
					},
					{
						name: 'Payout Updated',
						value: 'payout.updated',
						description: 'Triggers when a payout is updated',
					},
				],
				default: [],
			},
			{
				displayName: 'Payout Method Event Types',
				name: 'payoutMethodEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['payout_method', 'all'],
					},
				},
				options: [
					{
						name: 'Payout Method Created',
						value: 'payout_method.created',
						description: 'Triggers when a promoter adds a new payout method',
					},
					{
						name: 'Payout Method Deleted',
						value: 'payout_method.deleted',
						description: 'Triggers when a promoter deletes a payout method',
					},
					{
						name: 'Payout Method Updated',
						value: 'payout_method.updated',
						description: 'Triggers when a promoter updates a payout method',
					},
				],
				default: [],
			},
			{
				displayName: 'Promoter Campaign Event Types',
				name: 'promoterCampaignEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['promoter_campaign', 'all'],
					},
				},
				options: [
					{
						name: 'Promoter Campaign Accepted',
						value: 'promoter_campaign.accepted',
						description: 'Triggers when a promoter deletes a payout method',
					},
					{
						name: 'Promoter Campaign Blocked',
						value: 'promoter_campaign.blocked',
						description: 'Triggers when a promoter is banned/blocked in a campaign',
					},
					{
						name: 'Promoter Campaign Created',
						value: 'promoter_campaign.created',
						description: 'Triggers when a promoter was is to a campaign',
					},
					{
						name: 'Promoter Campaign Deleted',
						value: 'promoter_campaign.deleted',
						description: 'Triggers when a promoter is removed from a campaign',
					},
					{
						name: 'Promoter Campaign Inactive',
						value: 'promoter_campaign.inactive',
						description: 'Triggers when a promoter is inactive in a campaign',
					},
					{
						name: 'Promoter Campaign Pending',
						value: 'promoter_campaign.pending',
						description:
							'Triggers when a promoter is pending and awaiting manual review and approval',
					},
					{
						name: 'Promoter Campaign Rejected',
						value: 'promoter_campaign.rejected',
						description: 'Triggers when a promoter is rejected in a campaign',
					},
					{
						name: 'Promoter Campaign Updated',
						value: 'promoter_campaign.updated',
						description:
							'Triggers when a promoter’s participation in a campaign has changed (e.g., status, ref_token)',
					},
				],
				default: [],
			},
			{
				displayName: 'Promoter Event Types',
				name: 'promoterEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['promoter', 'all'],
					},
				},
				options: [
					{
						name: 'Promoter Balance Updated',
						value: 'promoter.balance.updated',
						description: "Triggers when a promoter's earnings, current, or paid balance changed",
					},
					{
						name: 'Promoter Created',
						value: 'promoter.created',
						description: 'Triggers when a new promoter signed up or is created via the API',
					},
					{
						name: 'Promoter Deleted',
						value: 'promoter.deleted',
						description: 'Triggers when a promoter is deleted',
					},
					{
						name: 'Promoter Updated',
						value: 'promoter.updated',
						description: "Triggers when	a promoter's account details are changed",
					},
				],
				default: [],
			},
			{
				displayName: 'Referral Event Types',
				name: 'referralEventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						eventTypesCategory: ['referral', 'all'],
					},
				},
				options: [
					{
						name: 'Referral Cancelled',
						value: 'referral.cancelled',
						description:
							'Triggers when	a referral subscription is cancelled or referral is cancelled via the API',
					},
					{
						name: 'Referral Converted',
						value: 'referral.converted',
						description:
							'Triggers when	a lead converts to a customer. Only fires when the referral makes the first purchase payment.',
					},
					{
						name: 'Referral Created',
						value: 'referral.created',
						description: 'Triggers when	a new referral (lead or customer) is tracked',
					},
					{
						name: 'Referral Deleted',
						value: 'referral.deleted',
						description: 'Triggers when	a referral record is deleted',
					},
					{
						name: 'Referral Moved',
						value: 'referral.moved',
						description:
							'Triggers when a referral is moved from one campaign to another. Only fires when an affiliate crosses a campaign upgrade/downgrade threshold and the campaign has referral moving enabled.',
					},
					{
						name: 'Referral Updated',
						value: 'referral.updated',
						description:
							"Triggers when a referral's details changed (e.g., state, plan, cancellation)",
					},
				],
				default: [],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const eventTypesCategory = this.getNodeParameter('eventTypesCategory', 0) as string;
				const campaignIds = this.getNodeParameter('campaignIds', 0) as number[];

				const selectedEventTypes: string[] = [];
				if (eventTypesCategory === 'all') {
					if (
						getSelectedEventTypes(this.getNodeParameter('commissionEventTypes', 0) as string[])
							.length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('commissionEventTypes', 0) as string[],
							),
						);
					}
					if (
						getSelectedEventTypes(
							this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
						).length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
							),
						);
					}
					if (
						getSelectedEventTypes(this.getNodeParameter('paymentsBatchEventTypes', 0) as string[])
							.length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('paymentsBatchEventTypes', 0) as string[],
							),
						);
					}
					if (
						getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]).length >
						0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]),
						);
					}
					if (
						getSelectedEventTypes(this.getNodeParameter('payoutMethodEventTypes', 0) as string[])
							.length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('payoutMethodEventTypes', 0) as string[],
							),
						);
					}
					if (
						getSelectedEventTypes(
							this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
						).length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
							),
						);
					}
					if (
						getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[])
							.length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[]),
						);
					}
					if (
						getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[])
							.length > 0
					) {
						selectedEventTypes.push(
							...getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[]),
						);
					}
				} else if (eventTypesCategory === 'commission') {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('commissionEventTypes', 0) as string[]),
					);
				} else if (eventTypesCategory === 'contract_document') {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
						),
					);
				} else if (eventTypesCategory === 'payments_batch') {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('paymentsBatchEventTypes', 0) as string[],
						),
					);
				} else if (eventTypesCategory === 'payout') {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]),
					);
				} else if (eventTypesCategory === 'payout_method') {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('payoutMethodEventTypes', 0) as string[],
						),
					);
				} else if (eventTypesCategory === 'promoter_campaign') {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
						),
					);
				} else if (eventTypesCategory === 'promoter') {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[]),
					);
				} else if (eventTypesCategory === 'referral') {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[]),
					);
				}

				if (selectedEventTypes.length == 0) {
					if (eventTypesCategory != 'all') {
						throw new NodeOperationError(
							this.getNode(),
							`No '${toTitleCase(eventTypesCategory?.replace('_', ' '))} Events' selected`,
						);
					} else {
						throw new NodeOperationError(this.getNode(), `No event selected`);
					}
				}

				try {
					const { webhooks } = await fetchWebhooks(this);
					for (const webhook of webhooks) {
						if (
							webhook.event_types.every((event) => selectedEventTypes.includes(event)) &&
							webhookUrl === webhook.url &&
							webhook.campaign_ids.every((campaignId) => campaignIds.includes(campaignId))
						) {
							webhookData.webhookId = webhook.id;
							return true;
						}
					}
					return false;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), error, {
						description: getErrorDescription(error),
					});
				}
			},
			async create(this: IHookFunctions): Promise<boolean> {
				try {
					const webhookData = this.getWorkflowStaticData('node');
					const webhookUrl = this.getNodeWebhookUrl('default') as string;
					const eventTypesCategory = this.getNodeParameter('eventTypesCategory', 0) as string;
					const campaignIds = this.getNodeParameter('campaignIds', 0) as number[];

					const selectedEventTypes: string[] = [];
					if (eventTypesCategory === 'all') {
						if (
							getSelectedEventTypes(this.getNodeParameter('commissionEventTypes', 0) as string[])
								.length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('commissionEventTypes', 0) as string[],
								),
							);
						}
						if (
							getSelectedEventTypes(
								this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
							).length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
								),
							);
						}
						if (
							getSelectedEventTypes(this.getNodeParameter('paymentsBatchEventTypes', 0) as string[])
								.length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('paymentsBatchEventTypes', 0) as string[],
								),
							);
						}
						if (
							getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[])
								.length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]),
							);
						}
						if (
							getSelectedEventTypes(this.getNodeParameter('payoutMethodEventTypes', 0) as string[])
								.length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('payoutMethodEventTypes', 0) as string[],
								),
							);
						}
						if (
							getSelectedEventTypes(
								this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
							).length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
								),
							);
						}
						if (
							getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[])
								.length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('promoterEventTypes', 0) as string[],
								),
							);
						}
						if (
							getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[])
								.length > 0
						) {
							selectedEventTypes.push(
								...getSelectedEventTypes(
									this.getNodeParameter('referralEventTypes', 0) as string[],
								),
							);
						}
					} else if (eventTypesCategory === 'commission') {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('commissionEventTypes', 0) as string[],
							),
						);
					} else if (eventTypesCategory === 'contract_document') {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
							),
						);
					} else if (eventTypesCategory === 'payments_batch') {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('paymentsBatchEventTypes', 0) as string[],
							),
						);
					} else if (eventTypesCategory === 'payout') {
						selectedEventTypes.push(
							...getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]),
						);
					} else if (eventTypesCategory === 'payout_method') {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('payoutMethodEventTypes', 0) as string[],
							),
						);
					} else if (eventTypesCategory === 'promoter_campaign') {
						selectedEventTypes.push(
							...getSelectedEventTypes(
								this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
							),
						);
					} else if (eventTypesCategory === 'promoter') {
						selectedEventTypes.push(
							...getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[]),
						);
					} else if (eventTypesCategory === 'referral') {
						selectedEventTypes.push(
							...getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[]),
						);
					}

					if (selectedEventTypes.length === 0) {
						if (eventTypesCategory != 'all') {
							throw new NodeOperationError(
								this.getNode(),
								`No '${toTitleCase(eventTypesCategory?.replace('_', ' '))} Events' selected`,
							);
						} else {
							throw new NodeOperationError(this.getNode(), `No event selected`);
						}
					}

					const responseData = await createWebHook(
						this,
						campaignIds,
						selectedEventTypes,
						webhookUrl,
					);
					if (responseData?.id === undefined) {
						// Required data is missing so was not successful
						return false;
					}

					webhookData.webhookId = responseData.id;

					return true;
				} catch (err) {
					throw new NodeOperationError(this.getNode(), err);
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					try {
						await deleteWebhook(this, webhookData.webhookId as number);
					} catch (err) {
						return false;
					}
					// Remove from the static workflow data so that it is clear
					// that no webhooks are registered anymore
					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	methods = {
		loadOptions: {
			async getCampaigns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getCampaigns(this);
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		try {
			const eventTypesCategory = this.getNodeParameter('eventTypesCategory', 0) as string;
			const response = this.getBodyData();
			const selectedEventTypes: string[] = [];

			if (eventTypesCategory === 'all') {
				if (
					getSelectedEventTypes(this.getNodeParameter('commissionEventTypes', 0) as string[])
						.length > 0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('commissionEventTypes', 0) as string[]),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('contractDocumentEventTypes', 0) as string[])
						.length > 0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
						),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('paymentsBatchEventTypes', 0) as string[])
						.length > 0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('paymentsBatchEventTypes', 0) as string[],
						),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]).length > 0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('payoutMethodEventTypes', 0) as string[])
						.length > 0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('payoutMethodEventTypes', 0) as string[],
						),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('promoterCampaignEventTypes', 0) as string[])
						.length > 0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(
							this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
						),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[]).length >
					0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[]),
					);
				}
				if (
					getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[]).length >
					0
				) {
					selectedEventTypes.push(
						...getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[]),
					);
				}
			} else if (eventTypesCategory === 'commission') {
				selectedEventTypes.push(
					...getSelectedEventTypes(this.getNodeParameter('commissionEventTypes', 0) as string[]),
				);
			} else if (eventTypesCategory === 'contract_document') {
				selectedEventTypes.push(
					...getSelectedEventTypes(
						this.getNodeParameter('contractDocumentEventTypes', 0) as string[],
					),
				);
			} else if (eventTypesCategory === 'payments_batch') {
				selectedEventTypes.push(
					...getSelectedEventTypes(this.getNodeParameter('paymentsBatchEventTypes', 0) as string[]),
				);
			} else if (eventTypesCategory === 'payout') {
				selectedEventTypes.push(
					...getSelectedEventTypes(this.getNodeParameter('payoutEventTypes', 0) as string[]),
				);
			} else if (eventTypesCategory === 'payout_method') {
				selectedEventTypes.push(
					...getSelectedEventTypes(this.getNodeParameter('payoutMethodEventTypes', 0) as string[]),
				);
			} else if (eventTypesCategory === 'promoter_campaign') {
				selectedEventTypes.push(
					...getSelectedEventTypes(
						this.getNodeParameter('promoterCampaignEventTypes', 0) as string[],
					),
				);
			} else if (eventTypesCategory === 'promoter') {
				selectedEventTypes.push(
					...getSelectedEventTypes(this.getNodeParameter('promoterEventTypes', 0) as string[]),
				);
			} else if (eventTypesCategory === 'referral') {
				selectedEventTypes.push(
					...getSelectedEventTypes(this.getNodeParameter('referralEventTypes', 0) as string[]),
				);
			}

			const eventType = (response?.event_type as string) ?? '';

			if (
				selectedEventTypes.length > 0 &&
				eventType != '' &&
				!selectedEventTypes.includes(eventType)
			) {
				return {
					webhookResponse: {
						received: true,
						ignored: true,
						reason: `Event type '${eventType}' is not in the selected events list`,
					},
				};
			}

			return {
				workflowData: [[{ json: response }]],
			};
		} catch (error) {
			const message = getErrorDescription(error);
			return {
				webhookResponse: {
					received: false,
					error: message,
				},
			};
		}
	}
}
