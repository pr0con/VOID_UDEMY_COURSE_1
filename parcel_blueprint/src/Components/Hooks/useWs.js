import { useEffect, useState } from "react";

export function useWs() {
	const [ rs, setRs ] = useState(0);
	const [ ws, setWs] = useState(null);  
	const [ jwt, setJwt ] = useState('^vAr^');
	const [ user, setUser ] = useState(null);
	const [ verifiedJwt, setVerifiedJwt ] = useState(null);
	const [ validCredentials, setValidCredentials ] = useState(null);
	const [ loading, setLoading ] = useState(true);
	
	const [ toastType, setToastType ] = useState('');
	const [ toastMsg, setToastMsg ] = useState('');
	const [ userAvail, setUserAvail ] = useState(true);
	
	const [ toggleModal, setToggleModal ] = useState(true);
	
	const [ clientList, setClientList ] = useState(null);
 	const [ mysqlDbs, setMysqlDbs ] = useState(null);
 	  	
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
				switch(tjo['type']) {
					case "jwt-token":
						request(tjo['jwt'],'verify-jwt-token','noop');	
						setJwt(tjo['jwt']);
						setUser(JSON.parse(tjo['data']));							
						break;
					case "jwt-token-valid":
						setVerifiedJwt(true);
						setValidCredentials(null);
						break;
					case "stored-jwt-token-valid":
						setVerifiedJwt(true);
						setJwt(window.localStorage.getItem('Pr0conJwt'));
						let storedUser = window.localStorage.getItem('User')
						setUser(JSON.parse(storedUser));
						setLoading(false);				
						break;
					case "jwt-token-invalid":
						setVerifiedJwt(null);
						setValidCredentials(null);
						setLoading(false);
						if(window.localStorage.getItem('Pr0conJwt') !== null) { window.localStorage.removeItem('Pr0conJwt');  }
						break;
					case "invalid-credentials":
						setValidCredentials(false)
						break;
					case "rapid-test-user-avail-fail": 
						setUserAvail(false); 
						break;
					case "rapid-test-user-avail-success": 
						setUserAvail(true); 
						break;
					case "toast-danger":
					case "toast-success":
						setToggleModal(!toggleModal);
						setToastType(tjo['type']);
						setToastMsg(tjo['data']);
						break;
					case "client-list":
						setClientList(JSON.parse(tjo['data']));
						break;
					case "mysql-dbs-list":
						setMysqlDbs(JSON.parse(tjo['data']));
						break
					default:
						break;
				}
			}
			ws.onclose = function(close_event) {
				console.log(close_event);
			}
			ws.onerror = function(error_event) {
				console.log(error_event);
			}
			request('noop','register-client','noop');
		}		
	}	
	

	useEffect(() => {
		if(ws === null) { setWs(new WebSocket('wss://void.pr0con.com:1200/api', ["master"] )); } // 
		if(ws !== null && rs === 0 ) { configureWebsocket(); heartbeat(ws); }			
	},[ws,rs]);	
	
	useEffect(() => {
	    if (jwt !== '^vAr^' && verifiedJwt) { 
		    console.log(jwt);
		    console.log("JWT has been verified..."+verifiedJwt); 
		    window.localStorage.setItem('Pr0conJwt',jwt); 
		    
		    //extract and store user...
		    window.localStorage.setItem('User',JSON.stringify(user));
		}
	}, [verifiedJwt]);

	
	return {
		rs,
		ws,
		setJwt,
		user,
		setUser,
		verifiedJwt,
		setVerifiedJwt,
		validCredentials,
		setValidCredentials,
		request,
		loading,
		setLoading,
		toastType,
		setToastType,
		toastMsg,
		setToastMsg,
		userAvail,
		setUserAvail,
		toggleModal,
		clientList,
		mysqlDbs,
  	};	
	   
}