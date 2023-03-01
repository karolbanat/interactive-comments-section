import { Comment } from '../main';
import { v4 as uuidv4 } from 'uuid';
import { addComment, getCurrentUser, updateComment } from './app';
import { insertCommentContent } from './comments';

const commentForm: HTMLFormElement = document.querySelector('#global-comment-form')!;
const commentInput: HTMLTextAreaElement = commentForm.querySelector('textarea#comment')!;
export const commentSubmit: HTMLButtonElement = commentForm.querySelector('button[type="submit"]')!;

export function handleCommentAdd(e: Event): void {
	e.preventDefault();

	const commentContent: string = commentInput.value;
	const { content, replyingTo } = processComment(commentContent);

	if (isBlank(content)) return;
	const newComment: Comment = {
		id: uuidv4(),
		content,
		createdAt: 'few seconds ago',
		replies: [],
		score: 0,
		user: getCurrentUser(),
	};
	if (replyingTo) newComment.replyingTo = replyingTo;

	addComment(newComment);
}

export function editFormHandler(e: Event): void {
	e.preventDefault();

	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const parentForm: HTMLFormElement = button.closest('form')!;
	const commentField: HTMLTextAreaElement = parentForm.querySelector('textarea')!;

	const processedComment = processComment(commentField.value);

	if (isBlank(processedComment.content)) return;

	const commentId: string | undefined = parentForm.dataset.commentId;
	if (!commentId) return;

	const updatedComment: Comment | null = updateComment(commentId, processedComment);
	if (!updatedComment) return;

	insertCommentContent(updatedComment);
}

function processComment(commentContent: string): { content: string; replyingTo: string | undefined } {
	const replyTag = (commentContent.match(/^@\S+/) || [undefined])[0];
	const content = commentContent.replace(/^@\S+/, '').trim();

	return {
		content,
		replyingTo: replyTag?.replace(/@/gi, ''),
	};
}

function isBlank(value: string) {
	return value === '';
}
