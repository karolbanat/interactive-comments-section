import { loadComments } from './ts/app';
import { commentSubmit, handleCommentAdd } from './ts/forms';
import './style.css';

loadComments();

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

commentSubmit.addEventListener('click', handleCommentAdd);
