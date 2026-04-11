import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	IDataObject,
	NodeConnectionTypes,
} from 'n8n-workflow';

export class FirstPromoterWebhooksTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FirstPromoter Webhooks Trigger',
		icon: 'file:../../icons/firstpromoter.svg',
		name: 'firstPromoterWebhooksTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Trigger on FirstPromoter webhook events',
		subtitle:
			"={{$parameter.events.length > 0 ? 'Triggers on ' + $parameter.events.join(', ') : 'No events selected'}}",
		usableAsTool: true,
		defaults: { name: 'Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				path: 'firstpromoter',
				responseMode: '={{$parameter["responseMode"]}}',
				responseData: 'noData',
				nodeType: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				noDataExpression: true,
				required: true,
				options: [
					{ name: 'Fulfilment Pending', value: 'fulfilment_pending' },
					{ name: 'Lead Cancelled', value: 'lead_cancelled' },
					{ name: 'Lead Signup', value: 'lead_signup' },
					{ name: 'New Customer', value: 'lead_becomes_referral' },
					{ name: 'Promoter Accepted', value: 'promoter_accepted' },
					{ name: 'Promoter Signs Up', value: 'promoter_signs_up' },
					{ name: 'Reward Created', value: 'reward_created' },
				],
				default: [],
				description:
					'Select the events that you want to listen for. Kindly ensure that you have configured the webhook URL for the campaign that you want to listen for the events in FirstPromoter. You can configure the webhook URL in FirstPromoter Settings > Integrations > Webhooks.',
				hint: `<p>Kindly ensure that you have configured the webhook URL for the campaign that you want to listen for the events in FirstPromoter. You can configure the webhook URL in FirstPromoter <pre> Settings > Integrations > Webhooks</pre> section.</p>
				`,
			},
			{
				displayName: 'Fulfilment Pending Response Code',
				name: 'fulfilmentPendingResponseCode',
				type: 'options',
				displayOptions: {
					show: {
						events: ['fulfilment_pending'],
					},
				},
				options: [
					{
						name: '200 - Fulfilled',
						value: 200,
						description: 'Reward fulfilled on your end',
					},
					{
						name: '202 - Keep Pending',
						value: 202,
						description: 'Keep fulfilment marked as pending on FirstPromoter',
					},
					{
						name: '204 - No Content (Keep Pending)',
						value: 204,
						description: 'Keep fulfilment marked as pending on FirstPromoter',
					},
				],
				default: 200,
				description:
					'HTTP status to return for fulfilment_pending events. Use 200 when fulfilled, 2xx (except 200) to keep pending. See FirstPromoter docs.',
			},
			{
				displayName: 'Response Mode',
				name: 'responseMode',
				type: 'options',
				options: [
					{
						name: 'Respond Immediately',
						value: 'responseNode',
					},
					{
						name: 'Respond When Last Node Finishes',
						value: 'lastNode',
					},
				],
				default: 'responseNode',
				description: 'When to respond to the webhook',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		try {
			let body: unknown;
			try {
				body = this.getBodyData();
			} catch {
				body = {};
			}
			const jsonBody: IDataObject =
				typeof body === 'object' && body !== null
					? (body as IDataObject)
					: typeof body === 'string'
						? (() => {
								try {
									return JSON.parse(body || '{}') as IDataObject;
								} catch {
									return { raw: body } as IDataObject;
								}
							})()
						: {};

			let selectedEvents: string[] = [];
			try {
				const eventsParam = this.getNodeParameter('events', []) as unknown;
				const raw = Array.isArray(eventsParam)
					? eventsParam
					: eventsParam &&
						  typeof eventsParam === 'object' &&
						  'values' in eventsParam &&
						  Array.isArray((eventsParam as { values: unknown[] }).values)
						? (eventsParam as { values: unknown[] }).values
						: [];
				selectedEvents = raw.filter((v): v is string => typeof v === 'string');
			} catch {
				selectedEvents = [
					'lead_signup',
					'lead_cancelled',
					'promoter_signs_up',
					'promoter_accepted',
					'reward_created',
					'lead_becomes_referral',
					'fulfilment_pending',
				];
			}

			const eventType =
				jsonBody?.event && typeof jsonBody.event === 'object' && 'type' in jsonBody.event
					? String((jsonBody.event as IDataObject).type ?? '')
					: null;

			if (eventType && selectedEvents.length > 0 && !selectedEvents.includes(eventType)) {
				return {
					webhookResponse: {
						received: true,
						ignored: true,
						reason: `Event type "${eventType}" is not in the selected events list`,
					},
				};
			}

			if (eventType === 'fulfilment_pending') {
				const statusCode =
					(this.getNodeParameter('fulfilmentPendingResponseCode', 200) as number) || 200;

				if (statusCode === 200) {
					this.getResponseObject().status(statusCode);
				}
			}

			return {
				workflowData: [[{ json: jsonBody }]],
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return {
				webhookResponse: {
					received: false,
					error: message,
				},
			};
		}
	}
}
