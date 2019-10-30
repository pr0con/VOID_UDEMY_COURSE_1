import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledModal = styled.div`
	position: fixed;
	z-index: 0;
	
	width: 100vw;
	height: 100vh;
	
	top: 0px;
	left: 0px;
	
	overflow:hidden;
	background-color: rgba(41,48,59,.8);
	
	
	${({ showing }) => (showing === true) && `
    	z-index:4;
	`}	
	
	& #modal-center-dialog-container {
		position: relative;
		top: 50%;
		left: 50%;
		
		transform: translate(-50%,-50%);
		
		border-radius: 6px;	
		background: #fff;
		color: #29303b;
	
		max-width: 380px;
		max-height: 500px;
		box-shadow: 0 0 1px 1px rgba(20,23,28,.1),0 3px 1px 0 rgba(20,23,28,.1);
		
		& #modal-center-dialog-header {
			border-bottom: solid 1px #dedfe0;
		    border-top-left-radius: 6px;
		    border-top-right-radius: 6px;
		    color: #29303b;
		    display: block;
		    font-weight: 600;
		    font-size: 20px;
		    padding: 24px 24px 24px 24px;

			& #modal-center-dialog-header-text {
				display:inline-block;
			}
			& #close-modal {
				font-size: 3.6rem;
				display:inline-block;
				width: 20px;
				height: 20px;
				background: #686f7a;
				mask: url('/icons/20px/cross.svg');
				float: right;
				top: 2px;
				position: relative;
			}
			& #close-modal:hover { cursor:pointer; }
		}
		& #modal-center-dialog-content {
			padding: 24px 24px 24px 24px;
			
			& span {
				display: inline-block;
			 	position: relative;
			 	width: 100% important;
			}
			& span input {
				border-radius: 5px;
				width: 100%;
				color: #29303b;
				font-size: 18px;
				height: auto;
				padding: 11px 60px 12px 40px;
				border: 1px solid #cacbcc;
			}
			& span input:placeholder {
				color: #686f7a;
			}
			& span.modal-signup-text-input-fullname:before {
				width: 1.8rem;
				height: 1.8rem;
				content: '';
				mask: url('/icons/20px/new-person.svg');
				position: absolute;
				top: 50%;
				left: 10px;
				transform: translateY(-50%);
				background: #cacbcc;
			}			
			& span.modal-login-text-input-email:before {
				width: 1.8rem;
				height: 1.8rem;
				content: '';
				mask: url('/icons/20px/envelope.svg');
				position: absolute;
				top: 50%;
				left: 10px;
				transform: translateY(-50%);
				background: #cacbcc;
			}
			${({ emailValid, modalDisplay }) => (emailValid === false && modalDisplay == "signup") && `
				& span.modal-login-text-input-email:after {
					position:absolute;
					left: 10px;
					color: #FF7373;
					font-size: 12px;
					font-family: "Hackman-Bold";
					content: 'Email not valid...';
				}
			`}

			& span.modal-login-text-input-password:before {
				width: 1.8rem;
				height: 1.8rem;
				content: '';
				mask: url('/icons/20px/lock.svg');
				position: absolute;
				top: 50%;
				left: 10px;
				transform: translateY(-50%);
				background: #cacbcc;
			}
				
			#password-strength-indicator span {
				width: 42px;
				height: 4px;
				background: #dedfe0;
								
			}
			#password-strength-indicator span:not(:first-child) {
				margin-left: 2px;
			}
			${({ modalDisplay, pwdisupper , pwdislower }) => (modalDisplay == "signup" && pwdisupper == true && pwdislower == true) && `
				#password-strength-indicator span.pwd-has-upper-lower {
					background: #3DCC91;
				}
			`}
			
			${({ modalDisplay, pwdisnumeric  }) => (modalDisplay == "signup" && pwdisnumeric == true) && `
				#password-strength-indicator span.pwd-has-number {
					background: #3DCC91;
				}
			`}
			${({ modalDisplay, pwdisspecial  }) => (modalDisplay == "signup" && pwdisspecial == true) && `
				#password-strength-indicator span.pwd-is-special {
					background: #3DCC91;
				}
			`}					
			${({ modalDisplay, pwdlong }) => (modalDisplay == "signup" && pwdlong == true) && `
				#password-strength-indicator span.pwd-is-long {
					background: #3DCC91;
				}
			`}			
											
	
			& #modal-submit-login {
				widht: 100%;
				height: 4.8rem;
				text-align: center;
				line-height: 4.8rem;
				font-size: 1.8rem;
				color: #fff;
				background-color: #ec5252;
				border: 1px solid transparent;  
				border-radius: 2px;
				font-family: 'Hackman-Bold';
			}
			& #modal-submit-login:hover {
				color: #fff;
				background-color: #992337;
				border-color: transparent;
				cursor:pointer;
			}
			
			& span.modal-signup-text-input-fullname,
			& span.modal-login-text-input-email,
			& span.modal-login-text-input-password,
			#password-strength-indicator,
			& #modal-submit-login {
				margin-top: 5px;
			}
		}				
	}
}
`;

import { Alerts } from './Alerts.js';

export function Modal({ modalShowing, setModalShowing, modalDisplay, validjwt, validcreds, request, userAvail, setUserAvail }) {	
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ fullName, setFullName] = useState('');
	const [ headerText, setHeaderText ] = useState('');
	const [ submitText, setSubmitText ] = useState('');
		
	const [ isLong, setIsLong ] = useState(false);
	const [ hasNumber, setHasNumber ] = useState(false);
	const [ hasSpecial, setHasSpecial ] = useState(false);
	const [ hasUpper, setHasUpper ] = useState(false);
	const [ hasLower, setHasLower ] = useState(false);
	const [ passwordValid, setPasswordValid ] = useState(true);
	const [ emailValid , setEmailValid ] = useState(true);
	const [ trySignup, setTrySignup ] = useState(false);
	
	
	const doRequest = async () => {
		switch(modalDisplay) {
			case "login":
				let te = btoa(email);
				let tp = btoa(password);
				request('noop','get-jwt-token', JSON.stringify( { user: te, password: tp} ));
				break;
			case "signup":
				setTrySignup(true);
				if( emailValid === false || fullName === "" || !userAvail || email === "") { break; }
				if(isLong === true && hasNumber === true && hasSpecial === true && hasUpper === true && hasLower === true) { setPasswordValid(true);  } else { setPasswordValid(false); break; }
				request('noop','create-user', JSON.stringify( { user: email, fullname: fullName, password: password} ));
				break;
			default: 
				break;
		}
	}
			
	useEffect(() => {
		console.log(validjwt);
		
		(validjwt === true) ? setModalShowing(false) : '';	
		if (modalDisplay === 'login') {
			setHeaderText('Login to your Account!');
			setSubmitText('Login');
		} else if (modalDisplay === 'signup') {
			setHeaderText('Sign Up!');
			setSubmitText('Sign Up');
		}	
	},[validjwt]);
	
	
	var valid_email_timeout = null;
	function emailIsValid (email) {
	  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	}
	
	const waitTestEmail = (value) => {
	    clearTimeout(valid_email_timeout);
	
	    // Make a new timeout set to go off in 800ms
	    valid_email_timeout = setTimeout(function () {
	        let ev = emailIsValid(value); 
	        (value === "") ? ev = true : '';
	        if(value !== "" && ev === true) { request('noop','rapid-test-user-avail',value); }
	        setEmailValid(ev);
	    }, 500);		
	}
	
	var valid_password_timeout = null;
	const isUpperCase = (string) => /^[A-Z]*$/.test(string);
	const isLowerCase = (string) => /^[a-z]*$/.test(string);
	const isNumeric   = (string) => /^[0-9]*$/.test(string);
	const isSpecial   = (string) => /^[!@#\$%\^\&*\)\(+=._-]*$/.test(string);
	const waitTestPassword = (value) => {			
		setIsLong(false);
		setHasUpper(false);  
		setHasLower(false);
		setHasSpecial(false); 
		setHasNumber(false);
		
		(trySignup === true) ? setTrySignup(false) : '';
		clearTimeout(valid_password_timeout);
		
		valid_password_timeout = setTimeout(function () {
			let chAry = value.split("");
			
			for(var i = 0; i < chAry.length; i++) {
				if (isUpperCase(chAry[i])) { setHasUpper(true); }
				if (isLowerCase(chAry[i])) { setHasLower(true); }
				if (isNumeric(chAry[i]))   { setHasNumber(true); }
				if (isSpecial(chAry[i]))   { setHasSpecial(true); }
			}
			if (chAry.length >= 8) { setIsLong(true); }
			
			if(value == "") {
				setIsLong(false);  setHasUpper(false);  setHasLower(false); setHasSpecial(false); setHasNumber(false);
			}
		}, 500);
	}		
	
	const validationMessages = [
		'Needs Upper Case Letter',
		'Needs Lower Case Letter',
		'Needs at least 1 Number',
		'Needs 8 or More Characters',
		'Needs at leat 1 Special Character',
	];	
	return (
		<StyledModal onClick={(e) => setModalShowing(false) } showing={modalShowing} emailValid={emailValid} modalDisplay={modalDisplay} pwdlong={isLong} pwdisupper={hasUpper} pwdislower={hasLower} pwdisspecial={hasSpecial} pwdisnumeric={hasNumber} >
			<div id="modal-center-dialog-container" onClick={(e) => e.stopPropagation()}>
				<div id="modal-center-dialog-header">
					<div id="modal-center-dialog-header-text">{  headerText } </div><div id="close-modal" onClick={(e) => setModalShowing(false) } ></div>
				</div>
				<div id="modal-center-dialog-content">
					{ (validcreds !== null && validcreds === false) && <Alerts type="danger" msg="Invalid Credentials. Please make sure your username and password are correct." showIcon={false} />  } 
					{ (modalDisplay === 'signup' && passwordValid === false && trySignup === true ) && <Alerts type="danger" msg="Password Validation Errors." ulErrorLogic={[hasUpper, hasLower, hasNumber, isLong, hasSpecial ]} ul={validationMessages} showIcon={false}/> }
					{ ((modalDisplay === 'signup' && trySignup === true) && (fullName === "" || email === "") ) && <Alerts type="danger" msg="All Fields Requied." showIcon={false} /> }
					
					{  (modalDisplay === 'signup' && !userAvail) && <Alerts type="danger" msg="Email Account Exists..." showIcon={false} /> }
					
					{ modalDisplay === 'signup' &&
						<span className="modal-signup-text-input-fullname"><input type="text" placeholder="Full Name" onChange={(e) => setFullName(e.target.value) }/></span>
					}
					
					<span className="modal-login-text-input-email"><input type="text" placeholder="Email" onChange={(e) => {  if( modalDisplay === "signup"){ waitTestEmail(e.target.value); }  setEmail(e.target.value);  }}/></span>
					<span className="modal-login-text-input-password" ><input type="password" placeholder="Password" onChange={(e) => {  if( modalDisplay === "signup"){ waitTestPassword(e.target.value); }  setPassword(e.target.value) }}/></span>
					
					{ modalDisplay === 'signup' &&
						<div id="password-strength-indicator"><span className="pwd-has-upper-lower" /><span className="pwd-has-number" /><span className="pwd-is-special"/><span className="pwd-is-long"/></div>
					}
					
					<div id="modal-submit-login" onClick={(e) =>  doRequest() }>{ submitText }</div>
				</div>
			</div>
		</StyledModal>		
	)
}

