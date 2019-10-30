import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const loadA = keyframes`
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
`;

//https://projects.lukehaas.me/css-loaders/
//https://dev.to/joshk2/how-i-created-my-own-react-spinners-library-4ckn
const StyledLoader = styled.div`
	& .loader,
	& .loader:before,
	& .loader:after {
	  background: rgb(236, 82, 82);
	  -webkit-animation: ${loadA} 1s infinite ease-in-out;
	  animation: ${loadA} 1s infinite ease-in-out;
	  width: 1em;
	  height: 4em;
	}
	& .loader {
	  color: rgb(236, 82, 82);
	  text-indent: -9999em;
	  margin: 88px auto;
	  position: relative;
	  font-size: 11px;
	  -webkit-transform: translateZ(0);
	  -ms-transform: translateZ(0);
	  transform: translateZ(0);
	  -webkit-animation-delay: -0.16s;
	  animation-delay: -0.16s;
	}
	& .loader:before,
	& .loader:after {
	  position: absolute;
	  top: 0;
	  content: '';
	}
	& .loader:before {
	  left: -1.5em;
	  -webkit-animation-delay: -0.32s;
	  animation-delay: -0.32s;
	}
	& .loader:after {
	  left: 1.5em;
	}
	
	${({ isPageLoad }) =>  isPageLoad == true && `
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
	`};
`;

export function Loader(props) {
	return (
		<StyledLoader isPageLoad={props.isPageLoad}>
			<div className="loader"></div>
		</StyledLoader>
	)
}