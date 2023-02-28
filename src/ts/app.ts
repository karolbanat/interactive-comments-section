import { User, Comment } from '../main';
import { appendComment } from './comments';
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
