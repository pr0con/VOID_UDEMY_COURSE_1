import React from 'react';
import styled from 'styled-components';

const OperationsLayout = styled.div`
	position: absolute;
	width: 0px;
	z-index: 0;
	transition: width .2s;
	overflow:hidden;
	transition-timing-function: ease-in-out;
	
	${({ opsShowing }) => opsShowing === true && `
		z-index: 4;
		width: 865px;
	`}
	
	top: 0px;
	left: 0px;
	background: #fff;
	margin: 0 auto;
	
	display: grid;
	grid-template-columns: 200px repeat(3, 1fr);
	grid-template-rows: 25px 100px 220px 25px;
	grid-gap: 20px;
	grid-row-gap: 10px;
	grid-column-gap: 10px;
	grid-gap: 10px;	
	
	& > div {
		border:1px dashed #aaa;
	}
	& > div.operations-layout-section.header {
		grid-column: 1 / -1;
	}
	& > div.operations-layout-section.content {
		grid-column: 2 / span 3;
		overflow:scroll;
	}
	& > div.operations-layout-section.sidebar {
		grid-column: 1 / 1;
		grid-row: 2 / span 2;
	}
	& > div.operations-layout-section.footer {
		grid-column: 1 / -1;
		display: flex;
	}
`;


import { Button } from './Button.js';
export function Operations({opsShowing, sseEvents, clientList, request, mysqlDbs  }) {
	//WE COULD HAVE THIS IN THE
	return (
		<OperationsLayout opsShowing={opsShowing}>
				<div className="operations-layout-section header"></div>
				<div className="operations-layout-section box1">
					{  (mysqlDbs !== null && mysqlDbs.length > 0) && mysqlDbs.map((db) => (
						<div>{ db }</div>
					))}						
				</div>
				<div className="operations-layout-section box2"></div>
				<div className="operations-layout-section box3"></div>
				<div className="operations-layout-section sidebar">
					{  clientList !== null &&  Object.keys(clientList).map((index) => 
						<div>{ clientList[index]['key'] }</div>		
					)}
				</div>
				<div className="operations-layout-section content">
					{  (sseEvents !== null && sseEvents.length > 0) &&  sseEvents.map((e) => (
						<div><span>{ e.id }</span>&nbsp;<span>{ e.msg }</span></div>		
					))}					
				</div>
				<div className="operations-layout-section footer">
					<Button btype="blue" text="List Mysql Databases" onClick={(e) => request('noop','get-mysql-databases','noop') }/>
				</div>			
		</OperationsLayout>		
	)
}