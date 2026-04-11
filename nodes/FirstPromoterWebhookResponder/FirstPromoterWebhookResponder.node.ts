import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

export class FirstPromoterWebhookResponder implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Respond to Webhook',
		name: 'firstPromoterWebhookResponder',
		group: ['output'],
		icon: 'file:../../icons/firstpromoter.svg',
		version: 1,
		usableAsTool: true,
		description: 'Return status code to FirstPromoter webhook',
		subtitle: `={{$parameter["statusCode"] != "" ? "Send " + $parameter["statusCode"] + " to FirstPromoter" : "Send 200 to FirstPromoter" }}`,
		defaults: {
			name: 'Respond to Webhook',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [],
		properties: [
			{
				displayName: 'Status Code',
				name: 'statusCode',
				type: 'options',
				options: [
					{ name: '200 - Fulfilled', value: 200 },
					{ name: '202 - Keep Pending', value: 202 },
					{ name: '204 - No Content (Keep Pending)', value: 204 },
				],
				default: 200,
				description: 'HTTP status code to return',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		try {
			const statusCode = this.getNodeParameter('statusCode', 0) as number;
			this.sendResponse({
				statusCode,
				body: { message: 'Webhook received successfully' },
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.sendResponse({
				statusCode: 500,
				body: { error: message ?? 'Invalid JSON or internal error' },
			});
		}
		// This node does not pass data forward
		return [[]];
	}
}
