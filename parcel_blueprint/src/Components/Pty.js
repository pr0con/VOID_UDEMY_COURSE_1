import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Terminal }  from 'xterm';
//import * as fit 	 from 'xterm/lib/addons/fit/fit';
//import * as attach   from 'xterm/lib/addons/attach/attach'; 
//Terminal.applyAddon(fit);
//Terminal.applyAddon(attach);


const StyledPty = styled.div`

	position: relative;

	width: 990px;
	max-width: 990px;
	
	height: 360px;
	max-height: 360px;
	
	
	
	overflow: scroll;
	
	&.terminal {
		display: flex
	}
	& .xterm-viewport {
		margin-top: auto;
	}
	
	
	& .xterm-screen,
	& .xterm-text-layer,
	& .xterm-selection-layer {
		max-width: 865px;
		max-height: 400px;
	}

	
	z-index: 3;
	overflow:hidden;	
	margin-bottom: 1.5rem;
`;

export function Pty() {
	const [ rs, setRs ] = useState(0);
	const [ ws, setWs] = useState(null); 


	const configureWebsocket = async() => {
		let term = null;
		var w = window.innerWidth;
		var h = window.innerHeight - 50; 		

		
		ws.onopen = function(open_event) {	
			term = new Terminal();
			term.open(document.querySelector(`#GoPtyContainer`));
			//term.fit();	
			term.resize(130,30);

					
			//term.attach(ws,true,true);
			ws.send(JSON.stringify({ type: 'Winsize', width: w, height: h })); 

			term.onData((d) => {
				ws.send(btoa(d));
			});	
			
	
			ws.onmessage = function(event) {
				term.write(atob(event.data));
			}
			ws.onclose = function(close_event) {
				console.log(close_event);
			}
			ws.onerror = function(error_event) {
				console.log(error_event);
			}
			//request('noop','get-jwt-token','noop');
		}		
	}	
	    
	useEffect(() => {
		if(ws === null) { setWs(new WebSocket('wss://void.pr0con.com:1200/pty')); }
		if(ws !== null && rs === 0 ) { configureWebsocket(); }		
	},[ws,rs])

	
	return (
		<StyledPty id="GoPtyContainer" />
  	)
}