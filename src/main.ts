import { v4 as uuidv4 } from 'uuid';
import { appendComment } from './ts/comments';
import { loadData, populateComments } from './ts/dataLoading';
import './style.css';

const commentForm: HTMLFormElement = document.querySelector('#global-comment-form')!;
const commentInput: HTMLTextAreaElement = commentForm.querySelector('textarea#comment')!;
const commentSubmit: HTMLButtonElement = commentForm.querySelector('button[type="submit"]')!;

let comments: Comment[] = [];
let currentUser: User;

loadData().then(data => {
	comments = [...data.comments];
	currentUser = data.currentUser;
	populateComments(comments);
});

export interface UserImage {
	png: string;
	webp: string;
}

export interface User {
	image: UserImage;
	username: string;
}

export interface Comment {
	id: string;
	content: string;
	createdAt: string;
	score: number;
	user: User;
	replies: Comment[];
	replyingTo?: string;
}

export interface AppData {
	comments: Comment[];
	currentUser: User;
}

export function isCurrentUser(username: string): boolean {
	return username === currentUser.username;
}

commentSubmit.addEventListener('click', (e: Event) => {
	e.preventDefault();

	const commentContent: string = commentInput.value;
	const replyTag = commentContent.match(/^@\S+/);
	const content = commentContent.replace(/^@\S+/, '').trim();

	if (isBlank(content)) return;
	const newComment: Comment = {
		id: uuidv4(),
		content,
		createdAt: 'few seconds ago',
		replies: [],
		score: 0,
		user: { ...currentUser },
	};
	if (replyTag) newComment.replyingTo = replyTag[0].replace(/@/gi, '');

	comments.push(newComment);
	appendComment(newComment);
});

function isBlank(value: string) {
	return value === '';
}
