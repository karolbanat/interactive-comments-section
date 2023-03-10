import { UserImage, User, Comment } from '../main';
import {
	downvote,
	getCurrentUser,
	getFormattedCommentContent,
	getFormattedReplyTag,
	isCurrentUser,
	removeComment,
	upvote,
} from './app';
import { editFormHandler, replyFormHandler } from './forms';
import { openModal } from './modal';

const commentsContainer: HTMLElement = document.querySelector('#comments-container')!;

type Action = 'EDIT' | 'DELETE' | 'REPLY';
type Vote = 'UPVOTE' | 'DOWNVOTE';

export function populateComments(comments: Comment[]): void {
	const commentsList: HTMLUListElement = createCommentsList(comments);
	commentsList.id = 'comments-list';
	commentsContainer.appendChild(commentsList);
}

export function createCommentsList(comments: Comment[], asReplies: boolean = false): HTMLUListElement {
	const commentsList: HTMLUListElement = document.createElement('ul');
	commentsList.classList.add('comments-grid');

	for (const comment of comments) commentsList.appendChild(createCommentsListElement(comment, asReplies));

	return commentsList;
}

function createCommentsListElement(comment: Comment, isReply: boolean = false): HTMLLIElement {
	const li: HTMLLIElement = document.createElement('li');
	li.classList.add('comments-grid');
	li.appendChild(createComment(comment, isCurrentUser(comment.user.username), isReply));

	if (comment.replies && comment.replies.length > 0) {
		li.classList.add('comments-grid');
		li.appendChild(createCommentsList(comment.replies, true));
	}

	return li;
}

export function createComment(comment: Comment, isCurrentUser: boolean = false, isReply: boolean = false): HTMLElement {
	const commentElement: HTMLElement = document.createElement('div');
	commentElement.classList.add('comment');
	commentElement.dataset.id = comment.id.toString();
	commentElement.dataset.reply = isReply.toString();
	if (isCurrentUser) commentElement.dataset.currentUser = 'true';

	commentElement.appendChild(createCommentHeader(comment.user, comment.createdAt));
	commentElement.appendChild(createCommentContent(comment.content, comment.replyingTo));
	commentElement.appendChild(createScore(comment.score));
	commentElement.appendChild(createActions(isCurrentUser));
	return commentElement;
}

/* comment header */
function createCommentHeader(user: User, createdAt: string): HTMLElement {
	const header: HTMLElement = document.createElement('div');
	header.classList.add('comment__header');
	header.appendChild(createUserAvatar(user.image));
	header.appendChild(createUserName(user.username));
	header.appendChild(createCreatedAt(createdAt));
	return header;
}

/* --- comment header elements */
function createUserAvatar(image: UserImage): HTMLPictureElement {
	const avatar: HTMLPictureElement = document.createElement('picture');

	const webpFallback: HTMLSourceElement = document.createElement('source');
	webpFallback.setAttribute('srcset', image.webp);
	webpFallback.setAttribute('type', 'image/webp');

	const img: HTMLImageElement = document.createElement('img');
	img.setAttribute('src', image.png);
	img.setAttribute('alt', '');
	img.classList.add('user-avatar');

	avatar.appendChild(webpFallback);
	avatar.appendChild(img);
	return avatar;
}

function createUserName(username: string): HTMLElement {
	const nameElement: HTMLSpanElement = document.createElement('span');
	nameElement.classList.add('comment__username');
	nameElement.innerText = username;
	return nameElement;
}

function createCreatedAt(createdAt: string): HTMLElement {
	const createdElement: HTMLSpanElement = document.createElement('span');
	createdElement.innerText = createdAt;
	return createdElement;
}

function createCommentContent(content: string, replyingTo: string | undefined): HTMLElement {
	const commentContentContainer: HTMLElement = document.createElement('div');
	commentContentContainer.classList.add('comment__content');
	commentContentContainer.appendChild(createCommentText(content, replyingTo));
	return commentContentContainer;
}

function createCommentText(content: string, replyingTo: string | undefined): HTMLParagraphElement {
	const commentText: HTMLParagraphElement = document.createElement('p');

	if (replyingTo) {
		const replyTag: HTMLSpanElement = document.createElement('span');
		replyTag.innerText = `@${replyingTo} `;
		commentText.appendChild(replyTag);
	}
	commentText.appendChild(document.createTextNode(content));

	return commentText;
}

/* comment score */
function createScore(score: number): HTMLElement {
	const scoreContainer: HTMLElement = document.createElement('div');
	scoreContainer.classList.add('score');
	scoreContainer.classList.add('comment__score');

	const scoreSpan: HTMLSpanElement = document.createElement('span');
	scoreSpan.innerText = score.toString();

	/* upvote button */
	scoreContainer.appendChild(createScoreButton('UPVOTE', './images/icon-plus.svg'));

	/* score number */
	scoreContainer.appendChild(scoreSpan);

	/* downvote button */
	scoreContainer.appendChild(createScoreButton('DOWNVOTE', './images/icon-minus.svg'));

	return scoreContainer;
}

function createScoreButton(vote: Vote, iconSource: string): HTMLButtonElement {
	const scoreButton: HTMLButtonElement = document.createElement('button');
	scoreButton.classList.add('score__vote-button');
	scoreButton.setAttribute('aria-label', vote.toLowerCase());
	scoreButton.appendChild(createScoreButtonIcon(iconSource));
	scoreButton.addEventListener('click', (e: Event) => {
		const button: HTMLButtonElement = e.target as HTMLButtonElement;
		const comment: HTMLElement | null = button.closest('.comment');
		if (!comment || Boolean(comment.dataset.currentUser)) return;

		const scoreContainer: HTMLElement | null = button.closest('.score');
		if (!scoreContainer) return;

		const scoreSpan: HTMLSpanElement | null = scoreContainer.querySelector('span');
		if (!scoreSpan) return;

		const newScore: number = vote === 'UPVOTE' ? upvote(comment.dataset.id!) : downvote(comment.dataset.id!);
		scoreSpan.innerText = newScore.toString();
	});
	return scoreButton;
}

function createScoreButtonIcon(iconSource: string): HTMLImageElement {
	const icon: HTMLImageElement = document.createElement('img');
	icon.setAttribute('src', iconSource);
	icon.setAttribute('alt', '');
	return icon;
}

/* comment actions */
function createActions(isCurrentUser: boolean = false): HTMLElement {
	const actionsContainer: HTMLElement = document.createElement('div');
	actionsContainer.classList.add('flex-align-center');
	actionsContainer.classList.add('comment__actions');

	if (isCurrentUser) {
		actionsContainer.appendChild(createActionButton('DELETE'));
		actionsContainer.appendChild(createActionButton('EDIT'));
	} else {
		actionsContainer.appendChild(createActionButton('REPLY'));
	}

	return actionsContainer;
}

function createActionButton(action: Action): HTMLButtonElement {
	const button: HTMLButtonElement = document.createElement('button');
	button.classList.add('action-button');
	button.classList.add(`action-button--${action.toLowerCase()}`);
	button.innerText = action.toLowerCase();

	button.addEventListener('click', getActionHandler(action));
	return button;
}

function getActionHandler(action: Action): (e: Event) => void {
	switch (action) {
		case 'DELETE':
			return deleteHandler;
		case 'EDIT':
			return editHandler;
		case 'REPLY':
			return replyHandler;
		default:
			return () => {};
	}
}

function deleteHandler(e: Event): void {
	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const comment: HTMLElement | null = button.closest('.comment');
	if (!comment) return;

	const id: string = comment.dataset.id!;
	openModal(() => {
		removeComment(id);
		removeCommentFromDOM(id);
	});
}

function editHandler(e: Event): void {
	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const comment: HTMLElement | null = button.closest('.comment');
	if (!comment) return;

	const id: string = comment.dataset.id!;
	const contentContainer: HTMLElement | null = comment.querySelector('.comment__content');
	if (!contentContainer) return;

	clearElement(contentContainer);
	contentContainer.appendChild(createEditForm(id));
}

function replyHandler(e: Event): void {
	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const comment: HTMLElement | null = button.closest('.comment');
	if (!comment) return;

	const id: string = comment.dataset.id!;
	const replyForm: HTMLFormElement = createReplyForm(id);

	comment.parentNode?.insertBefore(replyForm, comment.nextSibling);
}

export function insertCommentContent(comment: Comment): void {
	const commentElement: HTMLElement | null = document.querySelector(`[data-id="${comment.id}"]`);
	if (!commentElement) return;

	const contentContainer: HTMLElement | null = commentElement.querySelector('.comment__content');
	if (!contentContainer) return;

	clearElement(contentContainer);
	contentContainer.appendChild(createCommentContent(comment.content, comment.replyingTo));
}

function clearElement(element: HTMLElement): void {
	element.innerHTML = '';
}

/* forms */
function createEditForm(id: string): HTMLFormElement {
	const editForm: HTMLFormElement = document.createElement('form');
	editForm.classList.add('comment-form');
	editForm.classList.add('comment-form--edit');
	editForm.classList.add('edit-form-grid');
	editForm.dataset.commentId = id;

	const textarea: HTMLTextAreaElement = createTextarea(getFormattedCommentContent(id), 'Edit comment', 'comment-edit');

	const submitBtn: HTMLButtonElement = createSubmitButton('Update');
	submitBtn.addEventListener('click', editFormHandler);

	editForm.appendChild(textarea);
	editForm.appendChild(submitBtn);
	return editForm;
}

function createReplyForm(id: string): HTMLFormElement {
	const replyForm: HTMLFormElement = document.createElement('form');
	replyForm.classList.add('comment-form');
	replyForm.classList.add('comment-form-grid');
	replyForm.dataset.replyId = id;

	const userAvatar: HTMLPictureElement = createUserAvatar(getCurrentUser().image);
	userAvatar.dataset.area = 'avatar';

	const textarea: HTMLTextAreaElement = createTextarea(getFormattedReplyTag(id), 'Reply comment', 'comment-reply');
	textarea.dataset.area = 'input';

	const submitBtn: HTMLButtonElement = createSubmitButton('Reply');
	submitBtn.dataset.area = 'submit';
	submitBtn.addEventListener('click', replyFormHandler);

	replyForm.appendChild(userAvatar);
	replyForm.appendChild(textarea);
	replyForm.appendChild(submitBtn);
	return replyForm;
}

function createTextarea(value: string = '', label: string = 'Comment', name: string = 'comment'): HTMLTextAreaElement {
	const textarea: HTMLTextAreaElement = document.createElement('textarea');
	textarea.setAttribute('aria-label', label);
	textarea.name = name;
	textarea.value = value;
	return textarea;
}

function createSubmitButton(label: string = 'Send'): HTMLButtonElement {
	const submitBtn: HTMLButtonElement = document.createElement('button');
	submitBtn.classList.add('button');
	submitBtn.classList.add('button--primary');
	submitBtn.type = 'submit';
	submitBtn.innerText = label;
	return submitBtn;
}

export function appendComment(comment: Comment): void {
	const commentListElement: HTMLLIElement = createCommentsListElement(comment);
	const commentsList: HTMLUListElement | null = document.querySelector('#comments-list');
	commentsList?.appendChild(commentListElement);
}

export function updateCommentContent(comment: Comment): void {
	const commentElement: HTMLElement | null = document.querySelector(`[data-id="${comment.id}"]`);
	if (!commentElement) return;

	const contentContainer: HTMLElement | null = commentElement.querySelector('.comment__content');
	if (!contentContainer) return;

	clearElement(contentContainer);
	contentContainer.appendChild(createCommentContent(comment.content, comment.replyingTo));
}

export function appendReply(reply: Comment, replyId: string): void {
	const replyingToComment: HTMLElement | null = document.querySelector(`[data-id="${replyId}"]`);
	if (!replyingToComment) return;

	if (replyingToComment.closest('ul')?.id && replyingToComment.closest('ul')?.id === 'comments-list') {
		if (replyingToComment.nextSibling?.nodeName === 'UL') {
			replyingToComment.nextSibling.appendChild(createCommentsListElement(reply, true));
		} else {
			replyingToComment.parentNode?.insertBefore(createCommentsList([reply], true), replyingToComment.nextSibling);
		}
	} else {
		replyingToComment.closest('ul')?.appendChild(createCommentsListElement(reply, true));
	}
}

export function removeCommentFromDOM(id: string): void {
	const commentToRemove: HTMLElement | null = document.querySelector(`[data-id="${id}"]`);
	const parentList: HTMLUListElement | null | undefined = commentToRemove?.closest('ul');
	commentToRemove?.closest('li')?.remove();

	/* remove list if empty */
	if (parentList && parentList.children.length === 0) {
		parentList.remove();
	}
}
