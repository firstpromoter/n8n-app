import {
	ICredentialTestRequest,
	IHttpRequestMethods,
	ICredentialType,
	INodeProperties,
	IAuthenticate,
	Icon,
} from 'n8n-workflow';

export class FirstPromoterApi implements ICredentialType {
	name = 'firstPromoterApi';
	displayName = 'FirstPromoter API';
	icon: Icon = {
		light: 'file:../icons/firstpromoter.svg',
		dark: 'file:../icons/firstpromoter.dark.svg',
	};
	documentationUrl = 'https://docs.firstpromoter.com/api-reference-v2/api-admin/authentication';
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.firstpromoter.com/api/v2',
			method: 'GET' as IHttpRequestMethods,
			url: '/company/promoters',
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
				'Your FirstPromoter Account ID. Go to your account and navigate to Settings > Integrations > API integration section and copy Account id',
			type: 'string',
			default: '',
			hint: 'Go to your FirstPromoter account, navigate to Settings > Integrations > API integration section and copy Account id',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			typeOptions: { password: true },
			description:
				'Requires v2 API key for the FirstPromoter account. Go to your account, navigate to Settings > Integrations > API integration section and click Manage API keys',
			type: 'string',
			default: '',
			hint: 'Requires v2 API key. Go to your FirstPromoter account, navigate to Settings > Integrations > API integration section and click Manage API keys',
		},
	];

	authenticate: IAuthenticate = {
		type: 'generic',
		properties: {
			headers: {
				'Account-ID': '={{$credentials.accountId}}',
				Authorization: '=Bearer {{$credentials.apiKey}}',
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
	};
}
