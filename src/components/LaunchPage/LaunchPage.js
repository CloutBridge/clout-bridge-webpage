import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header, Button, Dropdown, Input, List } from 'semantic-ui-react';

import CloutBridgeLogo from '../../logos/CloutBridgeLogoShorter.png';

import "./LaunchPage.css"

class LaunchPage extends Component{
    constructor(props){
        super();
        this.props = props;
    }

    render(){
        return(
            <Segment padded='very'>

                <img src ={CloutBridgeLogo} />
                
                <Container text><Header>The Launch of Clout Bridge is near! </Header>
                    <Container textAlign='left'>
                    <List bulleted>
                       <List.Item><b>The coming bridge will allow Bitclout users to bridge there $CLOUT tokens to and from the Etherem blockchain!</b></List.Item>
                       <List.Item><b>Once bridged $bCLOUT tokens can be utilized as a 1:1 peg to $CLOUT.</b></List.Item> 
                       <List.Item><b>Bridged tokens will be utilized for a plethora decentralized applications including token swaps.</b></List.Item>
                       <List.Item><b>To learn more about Clout Bridge and our vision click on the Docs section on the sidebar.</b></List.Item>
                    </List>
                    </Container>
                    <Header>Support Clout Bridge by purchasing the creator coin <a href='https://bitclout.com/u/CloutBridge'>CloutBridge</a>.</Header>
                    
                </Container>
            </Segment>
        );
    }
}

export default LaunchPage;