import React from 'react';
import { createPortal, findDOMNode } from 'react-dom';
import './A11yDialog.css';

// This Dialog will not work well with dynamic content.
// Doesn't setState on scroll, so might act more smoothly in a scroll scenario.
//
// Accepts props: 
//  'onClose' - function - called when the dialog should close
//  'backdropColor', backdropClass', 'backdropStyle'
//  'className' and 'style' will be applied to the inner div in the dialog section
class Dialog extends React.Component {
	static focusablesSelector = `
    input,
    button,
    select,
    textarea,
    a,
    [tabindex],
    [contenteditable]`;

  state = { isOpen: false };
  
  focusRef = React.createRef()

	onKeydown = ev => {
		if (ev.code === 'Escape') return this.requestClose();
		if (ev.code !== 'Tab') return;

		ev.preventDefault();
		this.focusNext(ev.shiftKey);
	};

	requestClose = ev => {
		ev && ev.stopPropagation();
		this.props.onClose();
	};

	handleClose() {
		window.removeEventListener('keydown', this.onKeydown);
		window.removeEventListener('scroll', this.positionDialogRoot);
		this.parentElement.removeChild(this.dialogRoot);
		this.contentRoot.setAttribute('aria-hidden', false);
		this.prevFocused && this.prevFocused.focus();
		this.setState({ isOpen: false });
	};

	handleOpen() {
		this.prevFocused = document.activeElement;
		this.setupDOMFamily();
		this.contentRoot.setAttribute('aria-hidden', true);
		this.setState({ isOpen: true }, () => {
			this.setupFocusableElements();
			this.focusRef && this.focusRef.current
				? this.setFocus(this.focusRef.current)
				: this.focusNext();
			window.addEventListener('keydown', this.onKeydown);
		});
	};

	setupDOMFamily() {
		const { contentRef } = this.props;
		this.contentRoot =
			(contentRef && contentRef.current) ||
			findDOMNode(this).closest('body > *');
		this.parentElement = this.contentRoot.parentElement;
		this.isModal = this.parentElement === document.body;
		this.dialogRoot = this.parentElement.appendChild(
			document.createElement('div')
		);
		this.dialogRoot.classList.add('A11yDialogCmp__wrapper');
		if (!this.isModal) {
			this.positionDialogRoot();
			window.addEventListener('scroll', this.positionDialogRoot);
		}
	}

	positionDialogRoot = () => {
		const {
			top,
			left,
			width,
			height,
		} = this.contentRoot.getBoundingClientRect();

		this.dialogRoot.style.top = `${top}px`;
		this.dialogRoot.style.left = `${left}px`;
		this.dialogRoot.style.width = `${width}px`;
		this.dialogRoot.style.height = `${height}px`;
	};

	setupFocusableElements() {
		this.focusablesElements = Array.from(
			this.dialogRoot.querySelectorAll(Dialog.focusablesSelector)
		).map((el, idx) => ({ el, idx }));
	}

	setFocus(el) {
		const focusTarget = this.focusablesElements.find(
			focusable => focusable.el === el
		);
		if (focusTarget) {
			this.currentlyFocused = focusTarget;
			focusTarget.el.focus();
		} else this.currentlyFocused = null;
	}

	focusNext(isReverse = false) {
		let elements = this.focusablesElements.slice();
		if (this.currentlyFocused) {
			elements = [
				...elements.slice(this.currentlyFocused.idx + 1),
				...elements.slice(0, this.currentlyFocused.idx),
			];
		}
		if (isReverse) elements.reverse();
		const focusTarget = elements.find(({ el }) => !el.disabled);
		if (focusTarget) {
			this.currentlyFocused = focusTarget;
			focusTarget.el.focus();
		} else this.currentlyFocused = null;
	}

	// Currently not being called for clicks outside of the dialog
	shiftFocusOnClick = ev => {
		ev.stopPropagation();
		this.currentlyFocused =
			this.focusablesElements.find(({ el }) => el === document.activeElement) ||
			null;
	};

	componentDidMount() {
    if (!this.props.isOpen) return;
    if (!this.props.contentRef || this.props.contentRef.current) return this.handleOpen();
    setTimeout(() => this.handleOpen(), 0);
	}

	componentWillUnmount() {
		this.handleClose();
	}

	componentDidUpdate({ isOpen }) {
		if (this.props.isOpen === isOpen) return;

		this.props.isOpen ? this.handleOpen() : this.handleClose();
	}

	render() {
		if (!this.state.isOpen) return <div aria-hidden="true" hidden domreference="true" />

		const { requestClose, focusRef, state } = this;
		const {
			className = '',
			style = {},
			backdropClass = '',
      backdropStyle = {},
      backdropColor,
			children
    } = this.props;
    
    
		return createPortal(
			<React.Fragment>
				<div
					onClick={requestClose}
					className={`A11yDialogCmp__backdrop ${backdropClass}`}
					style={{backgroundColor: backdropColor, ...backdropStyle}}
				/>
				<div role="dialog" onClick={this.shiftFocusOnClick}>
					<div
						role="document"
						className={`A11yDialogCmp__dialogContent ${className}`}
						style={style}
					>
						{typeof children === 'function' ? children(focusRef) : children}
					</div>
				</div>
			</React.Fragment>,
			this.dialogRoot
		)
	}
}

export default Dialog;
