import React from 'react';
import styled from 'styled-components';

const StyledAlerts = styled.div`
	padding: 1.6rem;
	
	font-size: 1.5rem;
	border-radius: .2rem;

	border: 1px solid transparent
	border-color: transparent;
			
			
	${({ type }) => (type == "success" || type == "toast-success") && `
		background-color: #e9f7f1;
		color: #004025;
	`}	
	${({ type }) => (type == "danger" || type == "toast-danger")  && `
		background-color: #faebeb;
		color: #521822;	
	`}
	
	& ul li.hidden {
		display:none;
	}
	
	
	${({ type, showIcon }) => ((type == "success" || "toast-success") && showIcon) && `
		& .alert-icon {
			width: 2rem;
			heigt: 2rem;
			background: #46c28e;
			mask: url('/icons/20px/tick-circle.svg');
		}
	`}
`;

export function Alerts(props) {
	return(
		<StyledAlerts type={props.type} showIcon={props.showIcon}>
			{ props.showIcon && <span className="alert-icon"></span> }
			{ props.msg }
			
			{(props.ul && props.ul.length > 0) && (
				<ul>
					{props.ul.map((li,index) => (
						<li className={props.ulErrorLogic[index] && 'hidden'}>{ li }</li>
					))}	
				</ul>
			)}
		</StyledAlerts>
	)
}

