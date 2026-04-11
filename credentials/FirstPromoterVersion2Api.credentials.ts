import {
	ICredentialTestRequest,
	IHttpRequestMethods,
	ICredentialType,
	INodeProperties,
	Icon,
	IAuthenticate,
} from 'n8n-workflow';

export class FirstPromoterVersion2Api implements ICredentialType {
	name = 'firstPromoterVersion2Api';
	displayName = 'FirstPromoter Version 2 API';
	icon: Icon = {
		light: 'file:../icons/firstpromoter.svg',
		dark: 'file:../icons/firstpromoter-dark.svg',
	};
	documentationUrl = 'https://docs.firstpromoter.com/api-reference-v2/api-admin/authentication';
	test: ICredentialTestRequest = {
		request: {
			method: 'GET' as IHttpRequestMethods,
			url: 'https://api.firstpromoter.com/api/v2/company/promoters',
			headers: {
				'ACCOUNT-ID': '={{$credentials.accountId}}',
				Authorization: '=Bearer {{$credentials.apiKey}}',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			qs: {
				per_page: 1,
			},
		},
	};
	properties: INodeProperties[] = [
		{
			displayName: 'Account ID',
			name: 'accountId',
			description:
				'Your FirstPromoter account ID. Get it from your FirstPromoter account Settings > Integrations > API integration section > Account id',
			type: 'string',
			default: '',
			hint: 'The account ID for the FirstPromoter. Get it from your FirstPromoter account Settings > Integrations > API integration section > Account id',
		},
		{
			displayName: 'V2 API Key',
			name: 'apiKey',
			typeOptions: { password: true },
			description:
				'Requires V2 API key for the FirstPromoter account. Get it from your FirstPromoter account Settings > Integrations > API integration section > API integration section > Manage API keys',
			type: 'string',
			default: '',
			hint: 'The V2 API key for the FirstPromoter. Get it from your FirstPromoter account Settings > Integrations > API integration section > Manage API keys',
		},
	];

	authenticate: IAuthenticate = {
		type: 'generic',
		properties: {
			headers: {
				'ACCOUNT-ID': '={{$credentials.accountId}}',
				Authorization: '=Bearer {{$credentials.apiKey}}',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
	};
}
