import { UserImage, User, Comment } from '../main';
import { isCurrentUser, removeComment } from './app';

const commentsContainer: HTMLElement = document.querySelector('#comments-container')!;

type Action = 'EDIT' | 'DELETE' | 'REPLY';

export function populateComments(comments: Comment[]): void {
	const commentsList: HTMLUListElement = createCommentsList(comments);
	commentsContainer.appendChild(commentsList);
}

export function createCommentsList(comments: Comment[], dataId: string = 'global'): HTMLUListElement {
	const commentsList: HTMLUListElement = document.createElement('ul');
	commentsList.classList.add('comments-grid');
	commentsList.dataset.id = `comments-list-${dataId}`;

	for (const comment of comments) commentsList.appendChild(createCommentsListElement(comment));

	return commentsList;
}

function createCommentsListElement(comment: Comment): HTMLLIElement {
	const li: HTMLLIElement = document.createElement('li');
	li.appendChild(createComment(comment, isCurrentUser(comment.user.username)));

	if (comment.replies && comment.replies.length > 0) {
		li.classList.add('comments-grid');
		li.appendChild(createCommentsList(comment.replies, comment.id));
	}

	return li;
}

export function appendComment(comment: Comment, listDataId: string = 'global'): HTMLElement {
	const commentsList: HTMLUListElement = document.querySelector(
		`[data-id="comments-list-${listDataId}"]`
	) as HTMLUListElement;
	const commentElement: HTMLElement = createCommentsListElement(comment);

	if (commentsList) commentsList.appendChild(commentElement);
	return commentElement;
}

export function createComment(comment: Comment, isCurrentUser: boolean = false): HTMLElement {
	const commentElement: HTMLElement = document.createElement('div');
	commentElement.classList.add('comment');
	commentElement.dataset.id = comment.id.toString();
	if (isCurrentUser) commentElement.setAttribute('data-current-user', 'true');

	commentElement.appendChild(createCommentHeader(comment.user, comment.createdAt));
	commentElement.appendChild(craeteCommentContent(comment.content, comment.replyingTo));
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

function craeteCommentContent(content: string, replyingTo: string | undefined): HTMLElement {
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
	scoreContainer.appendChild(createScoreButton('upvote', './images/icon-plus.svg'));

	/* score number */
	scoreContainer.appendChild(scoreSpan);

	/* downvote button */
	scoreContainer.appendChild(createScoreButton('downvote', './images/icon-minus.svg'));

	return scoreContainer;
}

function createScoreButton(label: string, iconSource: string): HTMLButtonElement {
	const scoreButton: HTMLButtonElement = document.createElement('button');
	scoreButton.classList.add('score__vote-button');
	scoreButton.setAttribute('aria-label', label);
	scoreButton.appendChild(createScoreButtonIcon(iconSource));
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
			return deleteHanlder;
		default:
			return () => {};
	}
}

function deleteHanlder(e: Event): void {
	const button: HTMLButtonElement = e.target as HTMLButtonElement;
	const comment: HTMLElement | null = button.closest('.comment');
	if (!comment) return;

	const id: string = comment.dataset.id!;
	removeComment(id);
}

/* removing */
export function removeCommentFromDOM(id: string): void {
	const commentToRemove: HTMLElement | null = document.querySelector(`[data-id="${id}"]`);
	if (!commentToRemove) return;

	commentToRemove.closest('li')!.remove();
}
