import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const StyledNavDropMenu = styled.div`
	position: fixed;
	z-index: 4;
	top: 6.5rem;
	left: ${props => `${props.ndmpx}px` || '0px' };
	
	
	
	min-width: 30rem;
	min-height: 10rem;
	
	border: none;
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	border-top: 1px solid #e8e9eb;
	box-shadow: 0 4px 16px rgba(20,23,28,.25);
	color: #505763;
	font-size: 13px;

	background: #fff;
	padding: 15px 0 15px 0;

	&:after {
		left: auto;
		right: 12px;
		${({ navDropMenuType}) => navDropMenuType == "resources" && `
			left: 12px;
		`}
		
		border-color: transparent transparent #fff transparent;
    	top: -12px;
		box-sizing: border-box;
		border-style: solid;
		border-width: 0 10px 13px;
		content: '' !important;
		height: 0;
		position: absolute;
		width: 0;
	}
	
	& .text-link-item {
		height: 4.2rem;
		color: #007791;
		font-size: 1.5rem;
		font-weight: 600;
		padding: 10px 22px;
		width: 100%;
		position: relative;
		line-height: 2.2rem;
	}
	& .text-link-item:hover {
		background: #f2f3f5;
		cursor:pointer;
	}
	
	& .icon-text-link-item {
		width: 100%;
		color: #007791;
		font-size: 1.5rem;
		font-weight: 400;
		display:flex;
		padding: 5px 15px;
		flex-direction: row;
		align-items: center;
	}
	& .icon-text-link-item:hover {
		background: #f2f3f5;
		cursor:pointer;
	}	
`;


const DynamicIcon = styled.span`
	display:inline-block;
	background: #a1a7b3;
	width: 2rem;
	height: 2rem;
	mask: ${props => `url(${props.svgIconUrl}) no-repeat center center;`});
	mask-size: 2rem;
	margin-right: 1.5rem;
`;


export function NavDropMenu({ navDropMenuPosX, setNavDropMenuPosX, navDropMenuType, doLogOut }) {
	const [ jsonData, setJsonData ] = useState(null);
	
	useEffect(() => {
		let url = 'noop';
		setJsonData(null);	
		switch(navDropMenuType) {
			case "resources":
			case "profile":
				url = `https://void.pr0con.com:1200/rest/api/ui/navbar-drop-menu/${navDropMenuType}`;
				break;
			default:
				break;
		}
		
		if(url !== 'noop') {	
	  		const fetchData = async () => {
				const result = await axios(url);
				setJsonData(result.data);
				
				console.log(result.data);
		    };
		
		    fetchData();
		}			
	},[navDropMenuType]);
	
	const doAction = async(action) => {
		switch(action) {
			case "log-out":
				doLogOut();
				break;
				
			case "noop":
			default:
				break;
		}
		setNavDropMenuPosX(-320);
	}
		
	return (
		<StyledNavDropMenu ndmpx={navDropMenuPosX} navDropMenuType={navDropMenuType}>						
			{ jsonData != null && jsonData.elements.map((el) =>				
				<div className={el.type} onClick={(e) => doAction(el.action)}><DynamicIcon svgIconUrl={`/icons/20px/${el.icon}.svg`} />{ el.text }</div>				
			)}
		</StyledNavDropMenu>
	)
}