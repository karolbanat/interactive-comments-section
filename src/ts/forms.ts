import { Comment, CommentData } from '../main';
import { v4 as uuidv4 } from 'uuid';
import { addComment, getCurrentUser, updateComment } from './app';

const commentForm: HTMLFormElement = document.querySelector('#global-comment-form')!;
const commentInput: HTMLTextAreaElement = commentForm.querySelector('textarea#comment')!;
export const commentSubmit: HTMLButtonElement = commentForm.querySelector('button[type="submit"]')!;

export function handleCommentAdd(e: Event): void {
	e.preventDefault();

	const commentContent: string = commentInput.value;
	const { content, replyingTo }: CommentData = processComment(commentContent);

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

	const processedComment: CommentData = processComment(commentField.value);

	if (isBlank(processedComment.content)) return;

	const commentId: string | undefined = parentForm.dataset.commentId;
	if (!commentId) return;

	updateComment(commentId, processedComment);
}

function processComment(commentContent: string): CommentData {
	const replyTag: string | undefined = (commentContent.match(/^@\S+/) || [undefined])[0];
	const content: string = commentContent.replace(/^@\S+/, '').trim();

	return {
		content,
		replyingTo: replyTag?.replace(/@/gi, ''),
	};
}

function isBlank(value: string) {
	return value === '';
}
