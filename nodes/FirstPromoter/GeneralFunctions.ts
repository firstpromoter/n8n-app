import {
	IHookFunctions,
	IHttpRequestOptions,
	IExecuteFunctions,
	jsonParse,
	JsonObject,
	IDataObject,
	INodePropertyOptions,
	ILoadOptionsFunctions,
	NodeApiError,
	NodeOperationError,
	INodeExecutionData,
	jsonStringify,
} from 'n8n-workflow';

const credentialsName = 'firstPromoterApi';
const baseURL = 'https://api.firstpromoter.com/api/v2';

interface Webhook {
	id: number;
	url: string;
	description: string;
	event_types: string[];
	active: boolean;
	timeout: number;
	max_retries: number;
	campaign_ids: number[];
	headers: IDataObject;
	basic_auth_user: string;
	basic_auth_enabled: boolean;
}

interface Webhooks {
	webhooks: Webhook[];
}

interface ErrorData {
	error?: string;
	message?: string;
	errors?: IDataObject | string;
	transaction_id?: string;
}

export const getHeaders = async (
	ref: IHookFunctions | ILoadOptionsFunctions,
): Promise<IHttpRequestOptions['headers']> => {
	const { accountId, apiKey } = await ref.getCredentials(credentialsName);
	return {
		'Account-ID': accountId,
		Authorization: `Bearer ${apiKey}`,
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};
};

export const fetchWebhooks = async (ref: IHookFunctions): Promise<Webhooks> => {
	try {
		const endpoint = `${baseURL}/company/webhooks`;
		const headers = await getHeaders(ref);
		const options: IHttpRequestOptions = {
			method: 'GET',
			headers: headers,
			url: endpoint,
		};
		const response = (await ref.helpers.requestWithAuthentication.call(
			ref,
			credentialsName,
			options,
		)) as string;
		const data: Webhook[] = await jsonParse(response);
		return { webhooks: data };
	} catch (error) {
		if (error instanceof NodeApiError) {
			if (error.httpCode === '401') {
				throw new NodeOperationError(ref.getNode(), {
					message:
						'Please check your credentials and ensure you have provided the v2 API key and try again.',
				});
			} else {
				throw new NodeApiError(ref.getNode(), {
					message: error?.message,
					description: error?.description ?? '',
				});
			}
		} else {
			throw new NodeApiError(ref.getNode(), error, { description: getErrorDescription(error) });
		}
	}
};

export const createWebHook = async (
	ref: IHookFunctions,
	campaignIds: number[],
	eventTypes: string[],
	url: string,
): Promise<Webhook | undefined> => {
	const endpoint = `${baseURL}/company/webhooks`;
	try {
		const headers = await getHeaders(ref);
		const options: IHttpRequestOptions = {
			method: 'POST',
			headers: headers,
			url: endpoint,
			body: { campaign_ids: campaignIds, event_types: eventTypes, url },
		};

		const response = await ref.helpers.requestWithAuthentication.call(
			ref,
			credentialsName,
			options,
		);
		const webhook: Webhook = await jsonParse(response);
		return webhook;
	} catch (error) {
		if (error instanceof NodeApiError) {
			if (error.httpCode === '401') {
				throw new NodeOperationError(
					ref.getNode(),
					'Please check your credentials and ensure you have provided the v2 API key and try again.',
				);
			} else if (error.httpCode === '400') {
				throw new NodeApiError(ref.getNode(), {
					message: error?.message,
					description:
						error?.description ??
						`Could not successfully register webhook (${endpoint}) on FirstPromoter.`,
				});
			} else {
				throw new NodeApiError(ref.getNode(), {
					message: error?.message,
					description:
						error?.description ??
						`Could not successfully register webhook (${endpoint}) on FirstPromoter.`,
				});
			}
		} else {
			throw new NodeApiError(ref.getNode(), error, { description: getErrorDescription(error) });
		}
	}
};


export const deleteWebhook = async (ref: IHookFunctions, webhookId: number) => {
	try {
		const endpoint = `${baseURL}/company/webhooks/${webhookId}`;
		const headers = await getHeaders(ref);
		const options: IHttpRequestOptions = {
			method: 'DELETE',
			headers: headers,
			url: endpoint,
		};
		return await ref.helpers.requestWithAuthentication.call(ref, credentialsName, options);
	} catch (err) {
		ref.logger.warn(err);
		throw new NodeOperationError(ref.getNode(), err);
	}
};

export const getCampaigns = async (ref: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> => {
	const returnData: INodePropertyOptions[] = [];
	try {
		const response = await ref.helpers.httpRequestWithAuthentication.call(ref, credentialsName, {
			method: 'GET',
			url: `${baseURL}/company/campaigns`,
			headers: await getHeaders(ref),
		});

		if (response && Array.isArray(response) && response.length > 0) {
			for (const campaign of response) {
				returnData.push({
					name: campaign.name,
					value: campaign.id,
				});
			}
			return returnData.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
				return 0;
			});
		}
		return returnData;
	} catch (error) {
		if (error instanceof NodeApiError) {
			if (error.httpCode === '401') {
				throw new NodeOperationError(
					ref.getNode(),
					'Please check your credentials and ensure you have provided the v2 API key and try again.',
				);
			} else {
				throw new NodeOperationError(ref.getNode(), error?.description ?? error?.message);
			}
		} else {
			throw new NodeOperationError(ref.getNode(), error, {
				description: getErrorDescription(error),
			});
		}
	}
};

export const executeRequest = async (ref: IExecuteFunctions): Promise<INodeExecutionData[][]> => {
	let endpoint = '';
	let method: IHttpRequestOptions['method'] = 'GET';
	let body: IDataObject = {};
	let qs: IDataObject = {};
	const headers: IDataObject = {};


		const resource = ref.getNodeParameter('resource', 0) as string;
		const operation = ref.getNodeParameter('operation', 0) as string;
		if (resource === 'referrals') {
			switch (operation) {
				case 'list referrals':
					endpoint = '/company/referrals';
					method = 'GET';
					qs = {
						page: ref.getNodeParameter('page', 0, 1),
						per_page: ref.getNodeParameter('perPage', 0, 20),
					};
					break;
				case 'get referral':
					{
						const findBy = ref.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = ref.getNodeParameter('attributeValue', 0) as string;
						if (findBy === 'id') {
							endpoint = `/company/referrals/${attributeValue}`;
						} else {
							endpoint = `/company/referrals/${attributeValue}?find_by=${findBy}`;
						}
					}
					method = 'GET';
					break;

				case 'update referrals':
					{
						const findBy = ref.getNodeParameter('findReferralBy', 0) as string;
						const attributeValue = ref.getNodeParameter('attributeValue', 0) as string;
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
						promoter_campaign_id: ref.getNodeParameter('promoterCampaignId', 0),
						'split_details[percentage]': ref.getNodeParameter('splitDetailsPercentage', 0),
						'split_details[promoter_campaign_id]': ref.getNodeParameter(
							'splitDetailsPromoterCampaignId',
							0,
						),
					};
					break;

				case 'move':
					{
						const idsParam = ref.getNodeParameter('referralIds', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/referrals/move_to_promoter';
						method = 'POST';
						body = {
							promoter_campaign_id: ref.getNodeParameter('promoterCampaignId', 0),
							ids: ids,
						};
					}
					break;

				case 'delete referrals':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);

						body = { ids };
						endpoint = `/company/referrals`;
						method = 'DELETE';
					}
					break;
			}
		} else if (resource === 'tracking') {
			if (['sale', 'refund', 'cancellation'].includes(operation)) {
				const email = (ref.getNodeParameter('email', 0) as string)?.trim() || '';
				const uid = (ref.getNodeParameter('uid', 0) as string)?.trim() || '';
				if (!email && !uid) {
					throw new NodeOperationError(
						ref.getNode(),
						`When tracking a ${operation}, either Email or UID is required.`,
					);
				}
			}
			switch (operation) {
				case 'signup':
					endpoint = '/track/signup';
					method = 'POST';
					body = {
						email: ref.getNodeParameter('email', 0),
						uid: ref.getNodeParameter('uid', 0),
						tid: ref.getNodeParameter('tid', 0),
						ref_id: ref.getNodeParameter('ref_id', 0),
						ip: ref.getNodeParameter('ip', 0),
						created_at: ref.getNodeParameter('created_at', 0),
						skip_email_notification: ref.getNodeParameter('skip_email_notification', 0),
					};
					break;
				case 'sale':
					endpoint = '/track/sale';
					method = 'POST';
					body = {
						email: ref.getNodeParameter('email', 0),
						uid: ref.getNodeParameter('uid', 0),
						amount: ref.getNodeParameter('amount', 0),
						event_id: ref.getNodeParameter('event_id', 0),
						currency: ref.getNodeParameter('currency', 0),
						tid: ref.getNodeParameter('tid', 0),
						ref_id: ref.getNodeParameter('ref_id', 0),
						quantity: ref.getNodeParameter('quantity', 0),
						promo_code: ref.getNodeParameter('promo_code', 0),
						plan: ref.getNodeParameter('plan', 0),
						mrr: ref.getNodeParameter('mrr', 0),
						skip_email_notification: ref.getNodeParameter('skip_email_notification', 0),
					};
					break;
				case 'refund':
					endpoint = '/track/refund';
					method = 'POST';
					body = {
						email: ref.getNodeParameter('email', 0),
						uid: ref.getNodeParameter('uid', 0),
						amount: ref.getNodeParameter('amount', 0),
						event_id: ref.getNodeParameter('event_id', 0),
						currency: ref.getNodeParameter('currency', 0),
						sale_event_id: ref.getNodeParameter('sale_event_id', 0),
						quantity: ref.getNodeParameter('quantity', 0),
					};
					break;
				case 'cancellation':
					endpoint = '/track/cancellation';
					method = 'POST';
					body = {
						email: ref.getNodeParameter('email', 0),
						uid: ref.getNodeParameter('uid', 0),
					};
					break;
			}
		} else if (resource === 'commissions') {
			switch (operation) {
				case 'list commissions':
					{
						qs = {
							q: ref.getNodeParameter('searchByAttributeValue', 0, ''),
							page: ref.getNodeParameter('page', 0, 1),
							per_page: ref.getNodeParameter('perPage', 0, 25),
						};
					}
					endpoint = '/company/commissions';
					method = 'GET';

					break;
				case 'create commission':
					endpoint = '/company/commissions';
					method = 'POST';
					body = {
						commission_type: 'sale',
						referral_id: ref.getNodeParameter('referralId', 0),
						sale_amount: ref.getNodeParameter('saleAmount', 0),
						plan_id: ref.getNodeParameter('planId', 0),
						event_id: ref.getNodeParameter('eventId', 0),
						event_date: ref.getNodeParameter('eventDate', 0),
						internal_note: ref.getNodeParameter('internalNote', 0),
						external_note: ref.getNodeParameter('externalNote', 0),
						notify_promoter: ref.getNodeParameter('notifyPromoter', 0),
						billing_period: ref.getNodeParameter('billingPeriod', 0),
					};
					break;
				case 'create custom commission':
					endpoint = '/company/commissions';
					method = 'POST';
					body = {
						commission_type: 'custom',
						amount: ref.getNodeParameter('amount', 0),
						promoter_campaign_id: ref.getNodeParameter('promoterCampaignId', 0),
						unit: ref.getNodeParameter('unit', 0),
						event_date: ref.getNodeParameter('eventDate', 0),
						internal_note: ref.getNodeParameter('internalNote', 0),
						external_note: ref.getNodeParameter('externalNote', 0),
						notify_promoter: ref.getNodeParameter('notifyPromoter', 0),
					};
					break;

				case 'update commission':
					endpoint = `/company/commissions/${ref.getNodeParameter('commissionId', 0)}`;
					method = 'PUT';
					body = {
						internal_note: ref.getNodeParameter('commissionInternalNote', 0),
						external_note: ref.getNodeParameter('commissionExternalNote', 0),
					};
					break;
				case 'approve commissions':
					endpoint = '/company/commissions/approve';
					method = 'POST';
					{
						const idsParam = ref.getNodeParameter('commissionIDs', 0);
						const ids = toNumberArray(idsParam);
						body = { ids };
					}
					break;
				case 'deny commissions':
					endpoint = '/company/commissions/deny';
					method = 'POST';
					{
						const idsParam = ref.getNodeParameter('commissionIDs', 0, []);
						const ids = toNumberArray(idsParam);
						body = { ids };
					}
					break;
				case 'mark commission fulfilled':
					endpoint = '/company/commissions/mark_fulfilled';
					method = 'POST';
					{
						const idsParam = ref.getNodeParameter('commissionIDs', 0, []);
						const ids = toNumberArray(idsParam);
						body = { ids };
					}
					break;
				case 'mark commission unfulfilled':
					endpoint = '/company/commissions/mark_unfulfilled';
					method = 'POST';
					{
						const idsParam = ref.getNodeParameter('commissionIDs', 0, []);
						const ids = toNumberArray(idsParam);
						body = { ids };
					}
					break;
			}
		} else if (resource === 'promoters') {
			switch (operation) {
				case 'list promoters':
					endpoint = '/company/promoters';
					method = 'GET';
					qs = {
						page: ref.getNodeParameter('page', 0, 1),
						per_page: ref.getNodeParameter('perPage', 0, 20),
					};
					break;
				case 'get promoter':
					{
						const findBy = ref.getNodeParameter('findPromoterBy', 0) as string;
						const attributeValue = ref.getNodeParameter('attributeValue', 0) as string;
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
							email: ref.getNodeParameter('promoterEmail', 0),
							cust_id: ref.getNodeParameter('promoterCustId', 0),
							profile: {
								first_name: ref.getNodeParameter('promoterFirstName', 0),
								last_name: ref.getNodeParameter('promoterLastName', 0),
								website: ref.getNodeParameter('promoterWebsite', 0),
								company_name: ref.getNodeParameter('promoterCompanyName', 0),
								company_number: ref.getNodeParameter('promoterCompanyNumber', 0),
								phone_number: ref.getNodeParameter('promoterPhoneNumber', 0),
								vat_id: ref.getNodeParameter('promoterVatId', 0),
								country: ref.getNodeParameter('promoterCountry', 0),
								address: ref.getNodeParameter('promoterAddress', 0),
								avatar: ref.getNodeParameter('promoterAvatar', 0),
								w8_form_url: ref.getNodeParameter('promoterW8FormUrl', 0),
								w9_form_url: ref.getNodeParameter('promoterW9FormUrl', 0),
								description: ref.getNodeParameter('promoterDescription', 0),
								instagram_url: ref.getNodeParameter('promoterInstagramUrl', 0),
								youtube_url: ref.getNodeParameter('promoterYouTubeUrl', 0),
								linkedin_url: ref.getNodeParameter('promoterLinkedinUrl', 0),
								facebook_url: ref.getNodeParameter('promoterFacebookUrl', 0),
								twitter_url: ref.getNodeParameter('promoterTwitterUrl', 0),
								twitch_url: ref.getNodeParameter('promoterTwitchUrl', 0),
								tiktok_url: ref.getNodeParameter('promoterTiktokUrl', 0),
							},
							initial_campaign_id: ref.getNodeParameter('promoterInitialCampaignId', 0),
							drip_emails: ref.getNodeParameter('promoterDripEmails', 0),
						};
					}
					break;
				case 'update promoter':
					{
						endpoint = `/company/promoters/${ref.getNodeParameter('attributeValue', 0)}`;
						method = 'PUT';
						const customFieldsUpdate = buildCustomFields(
							ref.getNodeParameter('promoterCustomFields', 0, {}) as IDataObject,
						);
						body = {
							cust_id: ref.getNodeParameter('promoterCustId', 0),
							find_by: ref.getNodeParameter('findPromoterBy', 0),
							profile: {
								first_name: ref.getNodeParameter('promoterFirstName', 0),
								last_name: ref.getNodeParameter('promoterLastName', 0),
								website: ref.getNodeParameter('promoterWebsite', 0),
								company_name: ref.getNodeParameter('promoterCompanyName', 0),
								company_number: ref.getNodeParameter('promoterCompanyNumber', 0),
								phone_number: ref.getNodeParameter('promoterPhoneNumber', 0),
								vat_id: ref.getNodeParameter('promoterVatId', 0),
								country: ref.getNodeParameter('promoterCountry', 0),
								address: ref.getNodeParameter('promoterAddress', 0),
								avatar: ref.getNodeParameter('promoterAvatar', 0),
								w8_form_url: ref.getNodeParameter('promoterW8FormUrl', 0),
								w9_form_url: ref.getNodeParameter('promoterW9FormUrl', 0),
								description: ref.getNodeParameter('promoterDescription', 0),
								instagram_url: ref.getNodeParameter('promoterInstagramUrl', 0),
								youtube_url: ref.getNodeParameter('promoterYouTubeUrl', 0),
								linkedin_url: ref.getNodeParameter('promoterLinkedinUrl', 0),
								facebook_url: ref.getNodeParameter('promoterFacebookUrl', 0),
								twitter_url: ref.getNodeParameter('promoterTwitterUrl', 0),
								twitch_url: ref.getNodeParameter('promoterTwitchUrl', 0),
								tiktok_url: ref.getNodeParameter('promoterTiktokUrl', 0),
							},
							'profile[_destroy_w9form]':
								ref.getNodeParameter('profile_destroy_w9form', 0) ?? false,
							'profile[_destroy_w8form]':
								ref.getNodeParameter('profile_destroy_w8form', 0) ?? false,
						};
						if (customFieldsUpdate) (body as IDataObject).custom_fields = customFieldsUpdate;
					}
					break;
				case 'assign parent':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);

						endpoint = '/company/promoters/assign_parent';
						method = 'POST';
						body = {
							parent_promoter_id: ref.getNodeParameter('parentPromoterId', 0),
							ids: ids,
						};
					}
					break;
				case 'move promoters':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/move_to_campaign';
						method = 'POST';
						body = {
							from_campaign_id: ref.getNodeParameter('fromCampaignId', 0),
							to_campaign_id: ref.getNodeParameter('toCampaignId', 0),
							ids: ids,
							drip_emails: ref.getNodeParameter('dripEmails', 0),
							soft_move_referrals: ref.getNodeParameter('softMoveReferrals', 0),
						};
					}
					break;
				case 'add promoters':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/add_to_campaign';
						method = 'POST';
						body = {
							campaign_id: ref.getNodeParameter('campaignId', 0),
							ids: ids,
							drip_emails: ref.getNodeParameter('dripEmails', 0),
						};
					}
					break;
				case 'accept':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/accept';
						method = 'POST';
						body = {
							campaign_id: ref.getNodeParameter('campaignId', 0),
							ids: ids,
						};
					}
					break;
				case 'reject':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/reject';
						method = 'POST';
						body = {
							campaign_id: ref.getNodeParameter('campaignId', 0),
							ids: ids,
						};
					}
					break;
				case 'block':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/block';
						method = 'POST';
						body = {
							campaign_id: ref.getNodeParameter('campaignId', 0),
							ids: ids,
						};
					}
					break;
				case 'archive':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/archive';
						method = 'POST';
						body = {
							ids: ids,
						};
					}
					break;
				case 'restore':
					{
						const idsParam = ref.getNodeParameter('ids', 0);
						const ids = toNumberArray(idsParam);
						endpoint = '/company/promoters/restore';
						method = 'POST';
						body = {
							ids: ids,
						};
					}
					break;
			}
		} else if (resource === 'promo codes') {
			switch (operation) {
				case 'archive promo code by id':
					{
						endpoint = `/company/promo_codes/${ref.getNodeParameter('promoCodeId', 0)}`;
						method = 'DELETE';
					}
					break;

				case 'create promo code':
					{
						endpoint = '/company/promo_codes';
						method = 'POST';
						body = {
							code: ref.getNodeParameter('promoCode', 0),
							reward_id: ref.getNodeParameter('rewardId', 0),
							promoter_campaign_id: ref.getNodeParameter('promoterCampaignId', 0),
							description: ref.getNodeParameter('description', 0),
							metadata: normalizedJson(ref.getNodeParameter('metadata', 0, '{}') as string),
							details: normalizedJson(ref.getNodeParameter('details', 0, '{}') as string),
						};
					}
					break;

				case 'get promo code by id':
					{
						endpoint = `/company/promo_codes/${ref.getNodeParameter('promoCodeId', 0)}`;
						method = 'GET';
					}
					break;

				case 'get promo codes':
					if (ref.getNodeParameter('filterByPromoterCampaignId', 0) != '') {
						qs['promoter_campaign_id'] = ref.getNodeParameter('filterByPromoterCampaignId', 0);
					}

					{
						endpoint = '/company/promo_codes';
						method = 'GET';
					}
					break;

				case 'update promo code by id':
					{
						endpoint = `/company/promo_codes/${ref.getNodeParameter('promoCodeId', 0)}`;
						method = 'PUT';
						body = {
							code: ref.getNodeParameter('promoCode', 0),
							promoter_campaign_id: ref.getNodeParameter('promoterCampaignId', 0),
							description: ref.getNodeParameter('description', 0),
							metadata: normalizedJson(ref.getNodeParameter('metadata', 0, '{}') as string),
							details: normalizedJson(ref.getNodeParameter('details', 0, '{}') as string),
						};
					}
					break;
			}
		} else if (resource === 'api') {
			if (['call'].includes(operation)) {
				const urlPath = ref.getNodeParameter('urlPath', 0, '') as string;
				if (urlPath === '') {
					throw new NodeOperationError(ref.getNode(), {
						message: `When performing a custom FirstPromoter API call action, the 'URL Path' is required.`,
						description: 'URL Path is required',
					});
				}
			}

			switch (operation) {
				case 'call':
					{
						if (ref.getNodeParameter('sendQueryParameters', 0) == true) {
							const queryParameterCollection = ref.getNodeParameter(
								'queryParameterCollection',
								0,
								{},
							) as IDataObject;
							if (
								Object.keys(queryParameterCollection).length > 0 &&
								queryParameterCollection.queryParameters &&
								Array.isArray(queryParameterCollection.queryParameters)
							) {
								for (
									let index = 0;
									index < queryParameterCollection.queryParameters.length;
									index++
								) {
									const queryParameter = queryParameterCollection.queryParameters[index];
									if (queryParameter.parameterName != null && queryParameter.parameterName != '') {
										qs[queryParameter.parameterName] = queryParameter.parameterValue as string;
									}
								}
							}
						}
						if (ref.getNodeParameter('sendHeaderParameters', 0) == true) {
							const headerCollection = ref.getNodeParameter(
								'headerCollection',
								0,
								{},
							) as IDataObject;
							if (
								Object.keys(headerCollection).length > 0 &&
								headerCollection.headerParameters &&
								Array.isArray(headerCollection.headerParameters)
							) {
								for (let index = 0; index < headerCollection.headerParameters.length; index++) {
									const headerParameter = headerCollection.headerParameters[index];
									if (
										headerParameter.parameterName != null &&
										headerParameter.parameterName != ''
									) {
										headers[headerParameter.parameterName] =
											headerParameter.parameterValue as string;
									}
								}
							}
						}
						if (ref.getNodeParameter('sendBodyParameters', 0) == true) {
							body = normalizedJson(ref.getNodeParameter('body', 0, '{}') as string) ?? {};
						}

						endpoint = (ref.getNodeParameter('urlPath', 0) as string).replace(baseURL, '');
						method = (
							ref.getNodeParameter('method', 0) as string
						).toUpperCase() as IHttpRequestOptions['method'];
					}
					break;
			}
		} else {
			throw new NodeOperationError(ref.getNode(), {
				message: `${resource} not in FirstPromoter resource list`,
				description: 'This resource might have been added by the built-in tools',
			});
		}

		// making API call to FirstPromoter API
		const cleanBody = omitEmpty(body);
		const cleanQs = omitEmpty(qs);
		const response = await ref.helpers.httpRequestWithAuthentication.call(ref, credentialsName, {
			method,
			url: `${baseURL}${endpoint}`,
			headers: { ...headers },
			qs: Object.keys(cleanQs).length ? cleanQs : undefined,
			body: Object.keys(cleanBody).length ? cleanBody : undefined,
			json: true,
		});

		return [ref.helpers.returnJsonArray(response)];
};

export function getSelectedEventTypes(unknownEvents: unknown[]): string[] {
	let selectedEvents: string[] = [];
	const eventsParam = unknownEvents as unknown;
	const raw = Array.isArray(eventsParam)
			? eventsParam
			: eventsParam &&
				  typeof eventsParam === 'object' &&
				  'values' in eventsParam &&
				  Array.isArray((eventsParam as { values: unknown[] }).values)
				? (eventsParam as { values: unknown[] }).values
				: [];
	selectedEvents = raw.filter((v): v is string => typeof v === 'string');
	return selectedEvents;
}

export function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function getContextErrorData(context: unknown): ErrorData | undefined {
	if (!isObjectRecord(context) || !('data' in context)) {
		return undefined;
	}
	const { data } = context;
	return isObjectRecord(data) ? (data as ErrorData) : undefined;
}

export function getErrorDescription(error: JsonObject | string | undefined): string {
	if (error === undefined || error === null || error === 'undefined') {
		return 'Unknown error occurred!';
	}

	if (typeof error === 'string') {
		return error !== 'not found' ? error : 'Requested resource is not found';
	}

	if (
		error instanceof NodeApiError ||
		error instanceof NodeOperationError ||
		error instanceof Error
	) {
		const errorData = getContextErrorData(error.context);
		const withExtras = error as Error & { description?: string; errors?: JsonObject };

		const fromContext =
			errorData?.message ??
			errorData?.transaction_id ??
			errorData?.error ??
			(errorData?.errors != null ? jsonStringify(errorData.errors as JsonObject) : undefined);

		const desc =
			withExtras.description ??
			fromContext ??
			(withExtras.errors != null ? jsonStringify(withExtras.errors) : undefined) ??
			error.message;

		if (desc) {
			return desc;
		}

		return error.message !== 'not found' ? error.message : 'Requested resource is not found';
	}

	const jsonError = error as JsonObject;
	const fallback =
		(typeof jsonError.description === 'string' ? jsonError.description : undefined) ??
		(typeof jsonError.message === 'string' ? jsonError.message : undefined);

	return fallback ?? 'Unknown error occurred!';
}

export function toTitleCase(text: string): string {
	if (!text) return text;

	return text
		.split(' ')
		.map((word) => {
			if (!word) return word;
			const firstLetterIdx = word.split('').findIndex((_, index) => {
				const ch = word.charCodeAt(index);
				return (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122);
			});

			if (firstLetterIdx === -1) return word.toLowerCase();

			const prefix = word.substring(0, firstLetterIdx);
			const targetLetter = word[firstLetterIdx].toUpperCase();
			const remainder = word.substring(firstLetterIdx + 1).toLowerCase();

			return `${prefix}${targetLetter}${remainder}`;
		})
		.join(' ');
}

/** Build custom_fields hash from node parameter. Keys from company custom fields, values String or Array of Strings. */
export function buildCustomFields(param: IDataObject | undefined): IDataObject | undefined {
	if (!param || typeof param !== 'object') return undefined;
	const entries = (param.customField as IDataObject[] | undefined) ?? [];
	if (!Array.isArray(entries) || entries.length === 0) return undefined;
	const out: IDataObject = {};
	for (const entry of entries) {
		const key = entry.key as string | undefined;
		if (key === undefined || key === null || (key !== null && String(key).trim()) === '') continue;
		const rawVal = entry.value;
		if (rawVal === undefined || rawVal === null) continue;
		if (Array.isArray(rawVal)) {
			const arr = rawVal.filter(
				(v: unknown) => v !== undefined && v !== null && String(v).trim() !== '',
			) as string[];
			if (arr.length === 0) continue;
			out[key] = arr.length === 1 ? arr[0] : arr;
		} else {
			if (String(rawVal).trim() === '') continue;
			out[key] = rawVal;
		}
	}
	return Object.keys(out).length ? out : undefined;
}

/** Remove keys with empty values (undefined, null, or blank string) so they are not sent to the API. */
export function omitEmpty(obj: IDataObject): IDataObject {
	if (obj === undefined || obj === null) return {};
	return Object.fromEntries(
		Object.entries(obj).filter(([, v]) => {
			if (v === undefined || v === null) return false;
			if (typeof v === 'string' && v.trim() === '') return false;
			if (Array.isArray(v) && v.length === 0) return false;
			return true;
		}),
	) as IDataObject;
}

export function normalizedJson(value: string): IDataObject {
	const normalized = value.trim().replace(/^\s*\{\s*\}\s*$/, '{}');
	return normalized === '{}' ? {} : jsonParse(normalized);
}

export function toNumberArray(value: unknown): number[] {
	const allItems: number[] = [];
	if (Array.isArray(value)) {
		for (const val of value) {
			if (typeof val === 'string' && val !== '[]') {
				const strArr = val.split(',');
				const list: number[] = [];
				for (const str of strArr) {
					if (isSafeDigits(str?.trim())) {
						if (
							!list.includes(Number.parseInt(str?.trim())) &&
							!allItems.includes(Number.parseInt(str?.trim()))
						) {
							list.push(Number.parseInt(str?.trim()));
						}
					}
				}
				if (list.length > 0) allItems.push(...list);
			} else if (typeof val === 'number') {
				if (!allItems.includes(val)) allItems.push(val);
			}
		}
	}
	return allItems;
}

export function isSafeDigits(value: string): boolean {
   return isIntegerOnly(value);
}

export function isIntegerOnly(str: string) {
	return /^\d+$/.test(str);
}
