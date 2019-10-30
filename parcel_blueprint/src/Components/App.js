import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { useWs } from './Hooks/useWs.js';
import { NavBar } from './NavBar.js';
import { useNavDropMenu } from './Hooks/useNavDropMenu.js';
import { NavDropMenu } from './NavDropMenu.js';
import { useModal } from './Hooks/useModal.js';
import { Modal } from './Modal.js';
import { Loader } from './Loader.js';

import { Alerts } from './Alerts.js';
import { Pty } from './Pty.js';	
import { Prism } from './Prism.js';
import { usePrism } from './Hooks/usePrism.js';
import { VerticalMenu } from './VerticalMenu.js';
import { Operations } from './Operations.js';
import { useOperations } from './Hooks/useOperations.js';


const StyledContentArea = styled.div`
	position: relative;
	z-index: 1;
	
	width: 120rem;
	height: 100vh;
	margin: 0 auto;
	
	display: grid;
	grid-template-columns: 32rem 86.5rem;
	grid-auto-rows: min-content;
	grid-gap: 1.5rem;
	
	padding-top: 8rem;
	
	& #content-area-main-display-content {
		position: relative;
	}	
		
`;

function App() {
	const ws = useWs();
	const prism = usePrism();
	const modal = useModal();
	const ndm = useNavDropMenu();
	const ops = useOperations();
	
	const [ vms, setVms ] = useState([
		<VerticalMenu key="vm1" type="documentation" { ...prism }></VerticalMenu>,
		<VerticalMenu key="vm2" type="back-end" { ...prism }></VerticalMenu>,
		<VerticalMenu key="vm3" type="front-end" { ...prism }></VerticalMenu>,		
	]);
	
	const doLogOut = () => {
		ws.setJwt('^vAr^');
		ws.setUser(null);
		ws.setVerifiedJwt(null);
		ws.setValidCredentials(null);
		window.localStorage.removeItem('Pr0conJwt'); 
	}
	
	useEffect(() => {
		if(ws.rs === 1) {
			let storedJwt = window.localStorage.getItem('Pr0conJwt');
			
			if(storedJwt !== null) {
				let psjwt = JSON.parse(atob(storedJwt.split('.')[1]));
				let exp = new Date(psjwt['exp'] * 1000).toUTCString();
				let now = new Date(Date.now()).toUTCString();
				console.log(now);
				console.log(exp);
				if(exp > now) {
					console.log('Stored Jwt Good');
					ws.request(storedJwt,'validate-stored-jwt-token','noop');
				}
				if(exp < now) {
					ws.setLoading(false);
					window.localStorage.removeItem('Pr0conJwt'); 
				}
			} else if (storedJwt === null) {
				ws.setLoading(false);
			}
		}
	},[ws.rs]);	
	
	
	useEffect(() => {
		ws.setValidCredentials(null);
	},[modal.modalShowing])
	
	useEffect(() => {
		modal.setModalShowing(false);
	},[ws.toggleModal]);
	
	useEffect(() => {
		setTimeout(function () {
	        ws.setToastMsg("");
	    }, 5000);		
	},[ws.toastMsg]);	
	

	return (
		<>
			<NavBar {...ndm} { ...modal } loading={ws.loading} validjwt={ws.verifiedJwt} />
			<NavDropMenu {...ndm} doLogOut={doLogOut}  />
			
			{  ws.loading === false &&
				<StyledContentArea onMouseEnter={(e) => {ndm.setNavDropMenuPosX(-320)}}>
					<div id="content-area-main-display-void"></div>
					<div id="content-area-main-display-header">
						{	ws.toastMsg !== "" && 
							<Alerts type={ws.toastType} msg={ws.toastMsg} showIcon={true} />
						}						
					</div>	
					
					<div id="content-area-main-display-sidebar">
						{(ws.user && ws.user.role === "system-admin") && <VerticalMenu type="administration" opsShowing={ops.opsShowing } setOpsShowing={ops.setOpsShowing}></VerticalMenu> }
						{ vms.map((vm) =>(
							vm	 
						))}						
					</div>
					<div id="content-area-main-display-content">
						<Pty />
						<div id="prism-title">{ prism.prismPath }</div>
						<Prism  { ...prism } />
						<Operations { ...ops } clientList={ws.clientList} request={ws.request} mysqlDbs={ws.mysqlDbs} />
					</div>
				</StyledContentArea>
			}		
	
			{ ws.loading === true && <Loader isPageLoad={true} /> }	
			{ modal.modalShowing && <Modal {...modal} validjwt={ws.verifiedJwt} validcreds={ws.validCredentials} request={ws.request} userAvail={ws.userAvail} setUserAvail={ws.setUserAvail} /> }
		</>
	)
}

if (document.getElementById('react_root')) {
    ReactDOM.render(<App />, document.getElementById('react_root'));
}