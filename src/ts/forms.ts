import { CommentData, Comment } from '../main';
import { addComment, addReply, updateComment } from './app';
import { appendComment, appendReply, updateCommentContent } from './comments';

const commentForm: HTMLFormElement = document.querySelector('#global-comment-form')!;
export const commentSubmit: HTMLButtonElement = commentForm.querySelector('button[type="submit"]')!;

export function handleCommentAdd(e: Event): void {
	e.preventDefault();

	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const parentForm: HTMLFormElement = button.closest('form')!;
	const commentField: HTMLTextAreaElement = parentForm.querySelector('textarea')!;

	const processedComment: CommentData = processComment(commentField.value);
	if (isBlank(processedComment.content)) return;

	const comment: Comment = addComment(processedComment);
	appendComment(comment);
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

	const updatedComment: Comment | null = updateComment(commentId, processedComment);
	if (updatedComment) updateCommentContent(updatedComment);
}

export function replyFormHandler(e: Event): void {
	e.preventDefault();

	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const parentForm: HTMLFormElement = button.closest('form')!;
	const commentField: HTMLTextAreaElement = parentForm.querySelector('textarea')!;

	const processedComment: CommentData = processComment(commentField.value);

	if (isBlank(processedComment.content)) return;

	const replyId: string | undefined = parentForm.dataset.replyId;
	if (!replyId) return;

	const replyComment: Comment | null = addReply(processedComment, replyId);
	parentForm.remove();
	if (replyComment) appendReply(replyComment, replyId);
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
