import { FirstPromoter } from './nodes/FirstPromoter/FirstPromoter.node';
import { FirstPromoterApi } from './credentials/FirstPromoterApi.credentials';
import { FirstPromoterTrigger } from './nodes/FirstPromoter/FirstPromoterTrigger.node';

const nodes = [new FirstPromoter(), new FirstPromoterTrigger()];
const credentials = [new FirstPromoterApi()];

export default { nodes, credentials };
