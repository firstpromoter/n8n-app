import { IDataObject } from 'n8n-workflow';

/** Build custom_fields hash from node parameter. Keys from company custom fields, values String or Array of Strings. */
export function buildCustomFields(param: IDataObject | undefined): IDataObject | undefined {
	if (!param || typeof param !== 'object') return undefined;
	const entries = (param.customField as IDataObject[] | undefined) ?? [];
	if (!Array.isArray(entries) || entries.length === 0) return undefined;
	const out: IDataObject = {};
	for (const entry of entries) {
		const key = entry.key as string | undefined;
		if (key === undefined || key === null || String(key).trim() === '') continue;
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

export function parseJsonString(params: IDataObject | string): IDataObject {
	if (typeof params === 'string') {
		const normalized = params.trim().replace(/^\s*\{\s*\}\s*$/, '{}');
		return (normalized === '{}' ? {} : JSON.parse(normalized)) as IDataObject;
	} else {
		return params ?? {};
	}
}
