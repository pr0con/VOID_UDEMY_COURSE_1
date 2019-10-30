import React from 'react';
import styled from 'styled-components';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';


const Wrapper = styled.div`
  font-family: sans-serif;
  text-align: center;
  font-size: 1.2rem;
`

const Pre = styled.pre`
  text-align: left;
  margin: 1em 0;
  padding: 0.5em;

  overflow:scroll;

  & .token-line {
    line-height: 1.3em;
    height: 1.3em;
  }
`

const LineNo = styled.span`
  display: inline-block;
  width: 2em;
  user-select: none;
  opacity: 0.3;
`

//https://codesandbox.io/s/00o4wx0jqv
export function Prism({ prismData }) {
	return(
		<Wrapper>		
		  <Highlight {...defaultProps} theme={theme} code={prismData} language="jsx">
		    {({ className, style, tokens, getLineProps, getTokenProps }) => (
		      <Pre className={className} style={style}>
		        {tokens.map((line, i) => (
		          <div {...getLineProps({ line, key: i })}>
		            <LineNo>{i + 1}</LineNo>
		            {line.map((token, key) => <span {...getTokenProps({ token, key })} />)}
		          </div>
		        ))}
		      </Pre>
		    )}
		  </Highlight>			
		</Wrapper>
	)
}
