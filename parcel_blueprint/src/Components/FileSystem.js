import React, { useEffect, useState } from "react";
import styled from 'styled-components';

const StyledFileSystem  = styled.div`
	.file-system-path {
		font-style: italic;
	}

	& .file-system-documentation-level-one {
		display:flex;
		
		& .file-system-documentation-level-one-index { 
			font-size: 2rem;
			line-height: 2rem;
		}
		& .file-system-documentation-level-one-text {
			display: inline-block;
			margin-left: .5rem;
			font-size: 1.2rem;
			padding-top: .5rem;
		}
	}
	
	& .file-system-documentation-level-two-nodes {
		& .file-system-documentation-level-two-node {
			display: flex;
			margin-left: 2rem;
			
			& .file-system-documentation-level-two-node-index {
				font-size: 2rem;
				line-height: 2rem;
			}
			& .file-system-documentation-level-two-node-text {
				display: inline-block;
				margin-left: .5rem;
				font-size:1.2rem;
				padding-top: .5rem;	
			}	
		}
		& .file-system-documentation-level-two-node:hover {
			cursor:pointer;
		}
	}
	
	& .file-system-browser-level-one {
		display:flex;
		
		& .file-system-browser-level-one-icon { 
			width: 2rem;
			height: 2rem;
			mask: url('/icons/20px/document.svg');		
			background: #5c7080;
		}
		& .file-system-browser-level-one-icon.directory  {
			mask: url('/icons/20px/folder-close.svg');
		}
		& .file-system-browser-level-one-text {
			display: inline-block;
			margin-left: .5rem;
			font-size: 1.2rem;
			padding-top: .5rem;
		}
	}
	& .file-system-browser-level-one:hover {
		cursor:pointer;
	}	
	& .file-system-browser-level-one:hover .file-system-browser-level-one-icon {
		background: rgb(236,82,82);
	}
	

	& .file-system-browser-level-two-nodes {	
		& .file-system-browser-level-two-node {
			display: flex;
			margin-left: 2rem;
			
			& .file-system-browser-level-two-node-icon { 
				width: 2rem;
				height: 2rem;
				mask: url('/icons/20px/document.svg');	
				background: #5c7080;
			}
			& .file-system-browser-level-two-node-icon.directory  {
				mask: url('/icons/20px/folder-close.svg');
			}
			& .file-system-browser-level-two-node-text {
				display: inline-block;
				margin-left: .5rem;
				font-size: 1.2rem;
				padding-top: .5rem;
			}
		}
		& .file-system-browser-level-two-node:hover {
			cursor:pointer;
		}	
		& .file-system-browser-level-two-node:hover .file-system-browser-level-two-node-icon {
			background: rgb(236,82,82);
		}	
		
		& .file-system-browser-level-three-nodes {
			& .file-system-browser-level-three-node {
				display: flex;
				margin-left: 4.5rem;
				
				& .file-system-browser-level-three-node-icon { 
					width: 2rem;
					height: 2rem;
					mask: url('/icons/20px/document.svg');	
					background: #5c7080;
				}
				& .file-system-browser-level-three-node-icon.directory  {
					mask: url('/icons/20px/folder-close.svg');
				}
				& .file-system-browser-level-three-node-text {
					display: inline-block;
					margin-left: .5rem;
					font-size: 1.2rem;
					padding-top: .5rem;
				}
			}
			& .file-system-browser-level-three-node:hover {
				cursor:pointer;
			}	
			& .file-system-browser-level-three-node:hover .file-system-browser-level-three-node-icon {
				background: rgb(236,82,82);
			}
			
			& .file-system-browser-level-four-nodes {
				& .file-system-browser-level-four-node {
					display: flex;
					margin-left: 7rem;
					
					& .file-system-browser-level-four-node-icon { 
						width: 2rem;
						height: 2rem;
						mask: url('/icons/20px/document.svg');	
						background: #5c7080;
					}
					& .file-system-browser-level-four-node-icon.directory  {
						mask: url('/icons/20px/folder-close.svg');
					}
					& .file-system-browser-level-four-node-text {
						display: inline-block;
						margin-left: .5rem;
						font-size: 1.2rem;
						padding-top: .5rem;
					}
				}
				& .file-system-browser-level-four-node:hover {
					cursor:pointer;
				}	
				& .file-system-browser-level-four-node:hover .file-system-browser-level-four-node-icon {
					background: rgb(236,82,82);
				}			
			}	
		}		
	}
`;


/*** left off here  TODO ***/
/**** NOTE ADD COMPONENTS to menu and resources downloads somewhere else  as footer ****/

export function FileSystem({ path, fsType, setPrismPath, setPrismData }) {
	const [ rs, setRs ] = useState(0);
	const [ ws, setWs] = useState(null);
	
	const [ jsonData, setJsonData ] = useState(null);

	const request = async (jwt,type,data) => {
		let payload = {
			jwt,
			type,
			data
		};
		ws.send(JSON.stringify(payload));
	}
	
	const heartbeat = async (ws) => {	
		setTimeout(
		    function() {
				//console.log(ws.readyState);
				/*  0 	CONNECTING 	Socket has been created. The connection is not yet open.
					1 	OPEN 	The connection is open and ready to communicate.
					2 	CLOSING 	The connection is in the process of closing.
					3 	CLOSED 	The connection is closed or couldn't be opened.	
				*/	
				if(rs !== ws.readyState) {	    
					setRs(ws.readyState)			
			    }
		        heartbeat(ws);
		    }
		    .bind(this),
		    1000
		);
	}
	
	const configureWebsocket = async() => {
		ws.onopen = function(open_event) {	
			ws.onmessage = function(event) {
				console.log(event);
				let tjo = JSON.parse(event.data);
				
				if('path' in tjo) {
					setJsonData(tjo);
				}else {
					switch(tjo['type']) {
						case "rtn-file-data":
							setPrismData(tjo['data']);
							break;
						default:
							break;
					}
				}
			}
			ws.onclose = function(close_event) {
				console.log(close_event);
			}
			ws.onerror = function(error_event) {
				console.log(error_event);
			}
			
			//WS Ready::Send Initial Path...
			request('noop','get-fs-path', path);
		}		
	}		
	
	const getDocument = (p) => {
		setPrismPath(p);
		request('noop','return-fs-path-data', p);
	}
	
	useEffect(() => {
		if(ws === null) { setWs(new WebSocket('wss://void.pr0con.com:1200/api')); }
		if(ws !== null && rs === 0 ) { configureWebsocket(); heartbeat(ws); }		
	},[ws,rs])
		
	//fsi == file system node	
	const LevelOneAlias = ['A','B','C','D'];
	return(
		<StyledFileSystem>
			{ fsType === "Documentation" &&
				<div type="fs-type-documentation">
					<div className="file-system-path">{ path }</div>
					{ (jsonData !== null && jsonData['children'].length > 0) && jsonData['children'].map((fsn,index) => (
						<>
							<div className="file-system-documentation-level-one">
								<span className="file-system-documentation-level-one-index">{ LevelOneAlias[index] }.</span>
								<span className="file-system-documentation-level-one-text">{ jsonData['children'][index]['info']['name'] }</span>
							</div>
							<div className="file-system-documentation-level-two-nodes">
								{ fsn['children'].length > 0 && fsn['children'].map((fsnc,index) => (
									<div className="file-system-documentation-level-two-node">
										<span className="file-system-documentation-level-two-node-index">{ index + 1 }.</span>
										<span className="file-system-documentation-level-two-node-text" onClick={(e) => getDocument(fsnc['path'])}>{ fsnc['info']['name'] }</span>
									</div>
								))}
							</div>
						</>
					))}
				</div>
			}
			{ fsType === "Browser" &&
				<div type="fs-type-browser">
					<div className="file-system-path">{ path }</div>
					{ (jsonData !== null && jsonData['children'].length > 0) && jsonData['children'].map((fsn,index) => (
						<>
							<div className="file-system-browser-level-one">
								<span className={jsonData['children'][index]['info']['is_dir'] ? `file-system-browser-level-one-icon directory` : `file-system-browser-level-one-icon`}></span>
								<span className="file-system-browser-level-one-text"  onClick={(e) => getDocument(fsn['path'])}>{ jsonData['children'][index]['info']['name'] }</span>
							</div>
							<div className="file-system-browser-level-two-nodes">
								{ fsn['children'].length > 0 && fsn['children'].map((fsnc,index) => (
									<>
										<div className="file-system-browser-level-two-node">
											<span className={ fsn['children'][index]['info']['is_dir'] ? `file-system-browser-level-two-node-icon directory` : `file-system-browser-level-two-node-icon`}></span>
											<span className="file-system-browser-level-two-node-text"  onClick={(e) => getDocument(fsnc['path'])}>{ fsnc['info']['name'] }</span>								
										</div>
										<div className="file-system-browser-level-three-nodes">
											{ fsnc['children'].length > 0 && fsnc['children'].map((fsncc,index) => (
												<>
													<div className="file-system-browser-level-three-node">
														<span className={ fsnc['children'][index]['info']['is_dir'] ? `file-system-browser-level-three-node-icon directory` : `file-system-browser-level-three-node-icon`}></span>
														<span className="file-system-browser-level-three-node-text"  onClick={(e) => getDocument(fsncc['path'])}>{ fsncc['info']['name'] }</span>								
													</div>
													<div className="file-system-browser-level-four-nodes">
														{ fsncc['children'].length > 0 && fsncc['children'].map((fsnccc, index) => (															
															<div className="file-system-browser-level-four-node">
																<span className={ fsncc['children'][index]['info']['is_dir'] ? `file-system-browser-level-four-node-icon directory` : `file-system-browser-level-four-node-icon`}></span>
																<span className="file-system-browser-level-four-node-text"  onClick={(e) => getDocument(fsnccc['path'])}>{ fsnccc['info']['name'] }</span>								
															</div>
														))}
													</div>
												</>
											))}
										</div>
									</>
								))}
							</div>					
						</>
					))}
				</div>
			}
		</StyledFileSystem>
	)	
}