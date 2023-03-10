import { v4 as uuidv4 } from 'uuid';
import { User, Comment, CommentData } from '../main';
import { loadData, saveData } from './dataLoading';
import { populateComments } from './comments';

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

export function upvote(commentId: string): number {
	const comment: Comment | null = findComment(commentId);
	if (!comment) return 0;

	if (currentUser.upvoted.includes(commentId)) return comment.score;
	if (currentUser.downvoted.includes(commentId)) {
		currentUser.downvoted = currentUser.downvoted.filter(id => id !== commentId);
		comment.score++;
	}

	currentUser.upvoted = [...currentUser.upvoted, commentId];
	comment.score++;
	saveData({ currentUser, comments });
	return comment.score;
}

export function downvote(commentId: string): number {
	const comment: Comment | null = findComment(commentId);
	if (!comment) return 0;

	if (currentUser.downvoted.includes(commentId)) return comment.score;
	if (currentUser.upvoted.includes(commentId)) {
		currentUser.upvoted = currentUser.upvoted.filter(id => id !== commentId);
		comment.score--;
	}

	currentUser.downvoted = [...currentUser.downvoted, commentId];
	comment.score--;
	saveData({ currentUser, comments });
	return comment.score;
}

/* comments */
export function addComment(data: CommentData): Comment {
	const newComment: Comment = createComment(data);
	comments = [...comments, newComment];

	saveData({ currentUser, comments });
	return newComment;
}

export function addReply(data: CommentData, replyId: string): Comment | null {
	const commentReplyingTo: Comment | null = findComment(replyId);
	if (!commentReplyingTo) return null;

	const newComment: Comment = createComment(data);

	if (commentReplyingTo.replies) {
		commentReplyingTo.replies = [...commentReplyingTo.replies, newComment];
	} else {
		const parentComment: Comment | null = findParentComment(replyId);
		if (!parentComment) return null;

		parentComment.replies = [...(parentComment.replies || []), newComment];
	}

	saveData({ currentUser, comments });
	return newComment;
}

export function removeComment(id: string): Comment | null {
	const commentToRemove: Comment | null = findComment(id);
	if (!commentToRemove) return null;

	/* remove comment if in comments */
	comments = comments.filter(comment => comment.id !== id);

	/* remove comment if in replies */
	comments.forEach(comment => (comment.replies = comment.replies?.filter(reply => reply.id !== id)));

	saveData({ currentUser, comments });
	return commentToRemove;
}

export function updateComment(id: string, data: CommentData): Comment | null {
	const comment: Comment | null = findComment(id);
	if (!comment) return null;

	comment.content = data.content;
	if (data.replyingTo) comment.replyingTo = data.replyingTo;
	else delete comment.replyingTo;

	saveData({ currentUser, comments });
	return comment;
}

export function getFormattedCommentContent(id: string): string {
	const comment: Comment | null = findComment(id);
	if (!comment) return '';

	if (comment.replyingTo) return `@${comment.replyingTo} ${comment.content}`;
	return comment.content;
}

export function getFormattedReplyTag(id: string): string {
	const comment: Comment | null = findComment(id);
	if (!comment) return '';

	return `@${comment.user.username}`;
}

function createComment(data: CommentData): Comment {
	const comment: Comment = {
		id: uuidv4(),
		content: data.content,
		createdAt: 'few seconds ago',
		score: 0,
		user: currentUser,
	};

	if (data.replyingTo) comment.replyingTo = data.replyingTo;
	else comment.replies = [];

	return comment;
}

function findParentComment(id: string): Comment | null {
	for (const comment of comments) {
		if (comment.id.toString() === id) return null;

		const replies: Comment[] | undefined = comment.replies?.filter(reply => reply.id.toString() === id);
		if (replies && replies.length > 0) return comment;
	}

	return null;
}

function findComment(id: string): Comment | null {
	for (const comment of comments) {
		if (comment.id.toString() === id) return comment;

		if (comment.replies) {
			for (const reply of comment.replies) {
				if (reply.id.toString() === id) return reply;
			}
		}
	}

	return null;
}
