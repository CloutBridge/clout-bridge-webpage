import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header,List, Embed, Icon} from 'semantic-ui-react';

import "./LaunchPage.css"

//import CloutBridgeLogo from '../../logos/CloutBridgeLogoShorter.png';

import CloutBridgeLogo from '../../logos/newLogo/mainLogoRevised.png';

import RoadMapImage from '../../logos/roadmap/RoadMap.jpg';

class LaunchPage extends Component{
    constructor(props){
        super();
        this.props = props;
    }

    render(){
        return(
            <Segment padded='very'>
                <a id="goto"></a>
                <img src={CloutBridgeLogo} id="logoImage"/>
                <Container text>
                    <Header size='huge'>The Launch of CloutBridge is near! </Header>
                    <Container>
                        <Container textAlign='left'>
                            <List >
                                <List.Item></List.Item>
                                <List.Item>
                                    <List.Icon name="ethereum"/>
                                    <List.Content><b>CloutBridge will allow Bitclout users to bridge their $CLOUT between Bitclout and Ethereum!</b></List.Content>
                                </List.Item>
                                <List.Item></List.Item>
                                <List.Item>
                                    <List.Icon name="ethereum"/>
                                    <List.Content><b>Once bridged $bCLOUT tokens can be utilized as a 1:1 peg to $CLOUT.</b></List.Content>
                                </List.Item> 
                                <List.Item></List.Item>
                                <List.Item>
                                    <List.Icon name="ethereum"/>
                                    <List.Content><b>Bridged Clout will be utilized for a plethora decentralized applications including token swaps.</b></List.Content>
                                </List.Item>
                                <List.Item></List.Item>
                                <List.Item>
                                    <List.Icon name="ethereum"/>
                                    <List.Content><b>To learn more about Clout Bridge and our vision read the <a href='https://clout-bridge.gitbook.io/clout-bridge/'>Docs</a>.</b></List.Content>
                                </List.Item>
                            </List>
                        </Container>
                    </Container>
                    <Header>Support CloutBridge by purchasing the creator coin <a href='https://bitclout.com/u/CloutBridge'>CloutBridge</a>.</Header>
                </Container>
                <div id='smallSpace'/>
                <Container>
                    <Header>CloutBridge Demonstration Video</Header>
                    <Embed id='A6S2NFHw-UI' source='youtube'  aspectRatio='21:9' autoplay active placeholder={CloutBridgeLogo}></Embed>
                </Container>
                <div id='smallSpace' />
                <Container>
                    <img src ={RoadMapImage} />
                </Container>
                <div id='smallerSpace'/>
                <a href="goto"> <Icon name ='angle double up' size='huge'/></a>
            </Segment>
        );
    }
}

export default LaunchPage;