import { useState, useEffect } from 'react';

export function useOperations() {
	const [ opsShowing, setOpsShowing ] = useState(false);
	const [ sseEvents, setSseEvents ] = useState(null);

	const runSSE = async () => {		
		//SSE MESSAGES
		const sseSource = new EventSource("https://void.pr0con.com:1300/sse"); //PROPS FEED LISTEN URL....
		sseSource.onmessage = function(event) {
			console.log(event.data);
			
			let tjo = JSON.parse(event.data);
			switch(tjo['Type']) {
				case "SseUpdate":
					setSseEvents(tjo['Data']);
					break;
				default:
					break;
			}
		}		
	}
	
	useEffect(() => {
		runSSE();
	}, [])	

	return {
		opsShowing, 
		setOpsShowing,
		sseEvents,
		setSseEvents
	};
}