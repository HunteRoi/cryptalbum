export function toJsonData(data: object) {
	return JSON.parse(JSON.stringify(data)) as string;
}
