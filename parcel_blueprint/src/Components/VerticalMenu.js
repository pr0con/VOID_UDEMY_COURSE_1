import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const StyledVerticalMenu = styled.div`
	& .vertical-menu-title {
		font-size: 1.5rem;
		${({ atr }) => (atr === true) && `
	    	text-align: right;
		`}	
	}
	
	margin-bottom: 1.5rem;	
	
	& .vertical-menu-icon-link {
		display: flex;
		padding: 5px 15px;
		flex-direction: row;
		align-items: center;
		
		& .vertical-menu-icon-link-text {
			margin-left: 1rem;
			line-height: 2rem;
		}
		& .vertical-menu-icon-link-text:hover {
			cursor:pointer;
		}
	}
	
	& .vertical-menu-icon-link:hover .vertical-menu-icon-link-icon {
		background: rgb(236,82,82);
	}
`;

const DynamicIcon = styled.div`
	background: #686f7a;
	width: 1.5rem;
	height: 1.5rem;
	mask: ${props => `url(${props.svgIconUrl}) no-repeat center;`});
	mask-size: 1.5rem;
`;

import { FileSystem } from './FileSystem.js';
export function VerticalMenu({ type, title, atr, setPrismPath, setPrismData, opsShowing, setOpsShowing  }) {
	const [ jsonData, setJsonData ] = useState(null);
	const [ elements, setElements ] = useState([]);
	const [ dfs, setDfs ] = useState(null);
	const [ bfs, setBfs ] = useState(null);



	useEffect(() => {
		let url = 'noop';
		(type !== "") ?  url = `https://void.pr0con.com:1200/rest/api/ui/vertical-menu/${type}` : '';

		if(url !== 'noop') {		
	 		const fetchData = async () => {
				const result = await axios(url);
				setJsonData(result.data);
				
				var xelements = result.data.elements.filter(function (el) {
					return el.type === "vertical-menu-icon-link";
				});				
				setElements([...xelements]);

				//If docs file system extract that here
				var xdfs = result.data.elements.filter(el => {
					return el.component_type === "file-system-documentation";
				});
				setDfs(xdfs);

				//If Code file system extract that here
				var xbfs = result.data.elements.filter(el => {
					return el.component_type === "file-system-browser";
				});
				setBfs(xbfs);
				
				
				console.log(result.data);
				console.log(xdfs);
				console.log(xbfs);
		    };
		    fetchData();
		}
	},[]);

	const doAction = async(action) => {
		switch(action) {
			case "databases":
				setOpsShowing(!opsShowing);
				break;
			default:
				break;
		}
		setNavDropMenuPosX(-320);
	}	
	
	return(
		<StyledVerticalMenu atr={atr}>
			<div className="vertical-menu-title">{ jsonData !== null && jsonData.title }</div>
			{ elements != null && elements.map((el) =>
				<div className={el.type}>
					<DynamicIcon className={`${el.type}-icon`} svgIconUrl={`/icons/20px/${el.icon}.svg`}/><div className={`${el.type}-text`} onClick={(e) => doAction(el.action)}>{ el.text }</div>
				</div>
			)}
			
			{dfs !== null && dfs.length === 1 &&
				<FileSystem path={dfs[0]['path']} fsType="Documentation" setPrismPath={setPrismPath} setPrismData={setPrismData} />
			}			
			{bfs !== null && bfs.length === 1 &&
				<FileSystem path={bfs[0]['path']} fsType="Browser" setPrismPath={setPrismPath} setPrismData={setPrismData} />
			}			
		</StyledVerticalMenu>	
	)	
}