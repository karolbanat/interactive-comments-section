import { removeComment } from './app';

const confirmationModal: HTMLElement = document.querySelector('#delete-confirmation-modal')!;
const cancelButton: HTMLButtonElement = confirmationModal.querySelector('#cancel-button')!;
const confirmButton: HTMLButtonElement = confirmationModal.querySelector('#confirm-delete-button')!;

let confirmationCallback: () => void;

export function openModal(callback: () => void): void {
	confirmationModal.dataset.open = 'true';
	insertDropshadow();
	cancelButton.focus();
	confirmationCallback = callback;
}

export function closeModal(): void {
	confirmationModal.dataset.open = 'false';
	removeDropshadow();
}

function insertDropshadow(): void {
	const dropshadow: HTMLElement = document.createElement('div');
	dropshadow.classList.add('modal-dropshadow');
	document.body.appendChild(dropshadow);
}

function removeDropshadow(): void {
	const dropshadow: HTMLElement | null = document.querySelector('.modal-dropshadow');
	if (dropshadow) dropshadow.remove();
}

cancelButton.addEventListener('click', closeModal);
confirmButton.addEventListener('click', () => {
	closeModal();
	confirmationCallback();
	confirmationCallback = () => {};
});

export {};
