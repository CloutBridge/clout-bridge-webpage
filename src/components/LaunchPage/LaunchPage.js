import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header,List, Embed, Icon, Menu, Grid,Divider} from 'semantic-ui-react';

import "./LaunchPage.css"

import CloutBridgeLogo from '../../logos/newLogo/black/MainLogoAbelResize.png'

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
            <Segment style={{overflow:'auto', maxHeight:"92.25vh"}}>
                <Grid >
                    <Grid.Row >
                        <Grid.Column >
                            <a id="goto"></a>
                            <img src={CloutBridgeLogo} id="logoImage"/>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider />
                    <Grid.Row>
                        <Grid.Column>
                            <Container text>
                                <Header size='huge'><p id="releaseNear">The Release of CloutBridge is Near!</p> </Header>
                                <Container>
                                    <Container textAlign='left'>
                                        <List >
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content size=''><Header size='small'><p><b>CloutBridge will allow Bitclout users to bridge their $CLOUT between Bitclout and Ethereum!</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content><Header size='small'><p><b>Once bridged $bCLOUT tokens can be utilized as a 1:1 peg to $CLOUT.</b></p></Header></List.Content>
                                            </List.Item> 
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content><Header size='small'><p><b>Bridged Clout will be utilized for a variety of decentralized applications including token swaps.</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content><Header size='small'><p><b>To learn more about CloutBridge and our vision read the <a href='https://clout-bridge.gitbook.io/clout-bridge/'>Docs</a>.</b></p></Header></List.Content>
                                            </List.Item>
                                        </List>
                                    </Container>
                                </Container>
                                <Header size='large'><p>Support CloutBridge by purchasing the creator coin <a href='https://bitclout.com/u/CloutBridge'>CloutBridge</a>.</p></Header>
                            </Container>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider/>
                    <div id='smallSpace'/>
                    <Grid.Row textAlign='center'>
                        <Grid.Column>
                            <Container>
                                <Header size='large'><p>CloutBridge Demonstration Video</p></Header>
                                <Embed id='efaOS7gKvTQ' source='youtube'  aspectRatio='21:9' autoplay active placeholder={CloutBridgeLogo}></Embed>
                            </Container>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider/>
                    <div id='smallSpace' />
                    <Grid.Row>
                        <Grid.Column>

                                <img src ={RoadMapImage} />

                        </Grid.Column>
                        {/*<Container textAlign='right'>
                            <div id='smallerSpace'/>
                            <Menu.Item  onClick = {this.scrollToTop} borderless position=''>
                                <Icon name ='angle double up' size='huge'/>
                             </Menu.Item>
                        </Container>*/}
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }
}

export default LaunchPage;