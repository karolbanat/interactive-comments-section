import { Comment, AppData } from '../main';
import { createCommentsList } from './comments';

const commentsContainer: HTMLElement = document.querySelector('#comments-container')!;

export function populateComments(comments: Comment[]): void {
	const commentsList: HTMLUListElement = createCommentsList(comments);
	commentsContainer.appendChild(commentsList);
}

export async function loadData() {
	const localData = localStorage.getItem('appData');
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
