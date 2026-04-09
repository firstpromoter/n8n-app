import { FirstPromoter } from './nodes/FirstPromoter/FirstPromoter.node';
import { FirstPromoterLegacy } from './nodes/FirstPromoterLegacy/FirstPromoterLegacy.node';
import { FirstPromoterWebhooksTrigger } from './nodes/FirstPromoterWebhooksTrigger/FirstPromoterWebhooksTrigger.node';
import { FirstPromoterLegacyApi } from './credentials/FirstPromoterLegacyApi.credentials';
import { FirstPromoterVersion2Api } from './credentials/FirstPromoterVersion2Api.credentials';

export const nodes = [new FirstPromoter(), new FirstPromoterLegacy(), new FirstPromoterWebhooksTrigger()];
export const credentials = [new FirstPromoterLegacyApi(), new FirstPromoterVersion2Api()];

// For CommonJS default export compatibility used by n8n loader
export default {
nodes,
credentials,
};