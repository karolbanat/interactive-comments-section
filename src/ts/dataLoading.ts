import { AppData } from '../main';

const APP_DATA_KEY: string = 'appData';

export async function loadData() {
	const localData = localStorage.getItem(APP_DATA_KEY);
	let data: AppData;

	if (localData) data = JSON.parse(localData) as AppData;
	else data = await fetchAppData();

	return data as AppData;
}

export async function fetchAppData() {
	const response = await fetch('./data.json');
	const data = await response.json();
	return data as AppData;
}

export function saveData(data: AppData): void {
	localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}
