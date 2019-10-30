import { useState } from 'react';

export function useNavDropMenu() {
	
	const [ navDropMenuPosX, setNavDropMenuPosX ] = useState(-320);
	const [ navDropMenuType, setNavDropMenuType ] = useState('');
	
	return {
		navDropMenuPosX,
		setNavDropMenuPosX,
		navDropMenuType, 
		setNavDropMenuType
	};
}