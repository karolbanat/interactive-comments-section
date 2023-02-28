import { Comment } from '../main';
import { v4 as uuidv4 } from 'uuid';
import { addComment, getCurrentUser } from './app';

const commentForm: HTMLFormElement = document.querySelector('#global-comment-form')!;
const commentInput: HTMLTextAreaElement = commentForm.querySelector('textarea#comment')!;
export const commentSubmit: HTMLButtonElement = commentForm.querySelector('button[type="submit"]')!;

export function handleCommentAdd(e: Event): void {
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
		user: getCurrentUser(),
	};
	if (replyTag) newComment.replyingTo = replyTag[0].replace(/@/gi, '');

	addComment(newComment);
}

function isBlank(value: string) {
	return value === '';
}
