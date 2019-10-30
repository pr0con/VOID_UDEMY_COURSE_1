import { useState } from 'react';

export function usePrism() {
	const [ prismPath, setPrismPath ] = useState('A Welcome Message.');
	const [ prismData, setPrismData ] = useState(`I Am Deffault Data.`);

	return {
		prismPath,
		setPrismPath,
		prismData,
		setPrismData
	};
}