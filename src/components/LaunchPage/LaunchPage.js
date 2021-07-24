import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header,List, Embed, Icon, Menu, Grid,Divider} from 'semantic-ui-react';

import "./LaunchPage.css"

//import CloutBridgeLogo from '../../logos/CloutBridgeLogoShorter.png';

import CloutBridgeLogo from '../../logos/newLogo/mainLogoRevised2-2.png';

import RoadMapImage from '../../logos/roadmap/RoadMap.jpg';

class LaunchPage extends Component{
    constructor(props){
        super();
        this.props = props;
    }

    scrollToTop(){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    render(){
        return(
            <Segment style={{overflow:'auto', maxHeight:"93.25vh"}}>
                <Grid >
                    <Grid.Row >
                        <Grid.Column >
                            <a id="goto"></a>
                            <img src={CloutBridgeLogo} id="logoImage"/>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider />
                    <Grid.Row>
                        <Container text>
                            <Header size='huge'>The Launch of CloutBridge is Near! </Header>
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
                    </Grid.Row>
                    <Divider/>
                    <div id='smallSpace'/>
                    <Grid.Row>
                        <Container>
                            <Header>CloutBridge Demonstration Video</Header>
                            <Embed id='A6S2NFHw-UI' source='youtube'  aspectRatio='21:9' autoplay active placeholder={CloutBridgeLogo}></Embed>
                        </Container>
                    </Grid.Row>
                    <Divider/>
                    <div id='smallSpace' />
                    <Grid.Row>
                        <Container>
                            <img src ={RoadMapImage} />
                        </Container>
                        <Container textAlign='right'>
                            <div id='smallerSpace'/>
                            {/*<Menu.Item  onClick = {this.scrollToTop} borderless position=''>
                                <Icon name ='angle double up' size='huge'/>
                             </Menu.Item>*/}
                        </Container>
                        
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }
}

export default LaunchPage;