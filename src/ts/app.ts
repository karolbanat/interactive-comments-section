import { User, Comment } from '../main';
import { appendComment, removeCommentFromDOM } from './comments';
import { loadData, populateComments } from './dataLoading';

let comments: Comment[] = [];
let currentUser: User;

export function loadComments() {
	loadData().then(data => {
		comments = [...data.comments];
		currentUser = data.currentUser;
		populateComments(comments);
	});
}

/* user */
export function getCurrentUser(): User {
	return { ...currentUser };
}
export function isCurrentUser(username: string): boolean {
	return username === currentUser.username;
}

/* comments */
export function addComment(comment: Comment, origin: Comment[] = comments): void {
	origin.push(comment);
	appendComment(comment);
}

export function removeComment(id: string): Comment | null {
	const commentToRemove: Comment | null = findComment(id);
	if (!commentToRemove) return null;

	let commentOrigin: Comment[] | null = findCommentOrigin(id);
	if (!commentOrigin) return null;

	const idx: number = getCommentIdx(id, commentOrigin);
	if (idx === -1) return null;

	commentOrigin = commentOrigin.splice(idx, 1);
	removeCommentFromDOM(id);

	return commentToRemove;
}

function getCommentIdx(id: string, origin: Comment[] = comments): number {
	for (let i = 0; i < origin.length; i++) {
		if (origin[i].id.toString() === id) return i;
	}

	return -1;
}

function findCommentOrigin(id: string): Comment[] | null {
	for (const comment of comments) {
		if (comment.id.toString() === id) return comments;

		if (comment.replies.length > 0) {
			for (const reply of comment.replies) {
				if (reply.id.toString() === id) return comment.replies;
			}
		}
	}

	return null;
}

function findComment(id: string): Comment | null {
	for (const comment of comments) {
		if (comment.id.toString() === id) return comment;

		if (comment.replies.length > 0) {
			for (const reply of comment.replies) {
				if (reply.id.toString() === id) return reply;
			}
		}
	}

	return null;
}
