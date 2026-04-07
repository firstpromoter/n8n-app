import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
	IHttpRequestMethods,
	IAuthenticate,
} from 'n8n-workflow';

export class FirstPromoterLegacyApi implements ICredentialType {
	name = 'firstPromoterLegacyApi';
	displayName = 'FirstPromoter Legacy API';
	icon: Icon = {
		light: 'file:../icons/firstpromoter.svg',
		dark: 'file:../icons/firstpromoter-dark.svg',
	};
	documentationUrl = 'https://docs.firstpromoter.com/api-reference-v1/authentication';
  
	properties: INodeProperties[] = [
		{
			displayName: 'V1 (Legacy) API Key',
			name: 'apiKey',
			typeOptions: { password: true },
			description:
				'The v1 (legacy) API key for the FirstPromoter. Get it from your FirstPromoter account Settings > Integrations > Manage API keys',
			type: 'string',
			default: '',
		},
	];

	authenticate: IAuthenticate = {
		type: 'generic',
		properties: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-API-KEY': '={{$credentials.apiKey}}',
			}

		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET' as IHttpRequestMethods,
			url: 'https://firstpromoter.com/api/v1/promoters/list',
			qs: {
				per_page: 1, 
			},
		},
	};
}
