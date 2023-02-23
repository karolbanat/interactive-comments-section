import './style.css';
import { loadData, populateComments } from './ts/dataLoading';

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
	id: number;
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
