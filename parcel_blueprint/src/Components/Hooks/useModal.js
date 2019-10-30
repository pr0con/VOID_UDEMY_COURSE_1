import { useState } from 'react';

export function useModal() {
	const [ modalShowing, setModalShowing ] = useState(false);
	const [ modalDisplay, setModalDisplay ] = useState('login');
	
	return{
		modalShowing,
		setModalShowing,
		modalDisplay,
		setModalDisplay
	};
}