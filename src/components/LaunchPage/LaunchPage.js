import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header,List, Embed, Icon, Menu, Grid,Divider} from 'semantic-ui-react';

import "./LaunchPage.css"

import CloutBridgeLogo from '../../logos/newLogo/black/MainLogoAbelResize.png'

import RoadMapImage from '../../logos/roadmap/RoadMap.jpg';

import diamondIcon from '../../icons/diamond/smallerDiamond.png';

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
                                <Container>
                                <p id="heading1">The Release of CloutBridge is Near!</p>
                                    <div id="marginleft">
                                    <Container textAlign='left'>
                                        <List>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="diamond"/>
                                                <List.Content size=''><Header size='small'><p><b>CloutBridge allows Bitclout users to bridge their $CLOUT between Bitclout and Ethereum!</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="diamond"/>
                                                <List.Content><Header size='small'><p><b>Once bridged $bCLOUT tokens can be utilized as a 1:1 peg to $CLOUT.</b></p></Header></List.Content>
                                            </List.Item> 
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="diamond"/>
                                                <List.Content><Header size='small'><p><b>Bridged Clout will be utilized for a variety of decentralized applications including Uniswap.</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="diamond"/>
                                                <List.Content><Header size='small'><p><b>To learn more about CloutBridge and our vision read the <a href='https://clout-bridge.gitbook.io/clout-bridge/'>Docs</a>.</b></p></Header></List.Content>
                                            </List.Item>
                                        </List>
                                    </Container>
                                    </div>
                                </Container>
                            </Container>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider/>
                    <Grid.Row>
                        <Grid.Column>
                            <Container text>
                                <p id="heading1">Join The Clout DAO.</p>
                                <div id="marginleft">
                                    <Container textAlign='left'>
                                        <List>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content><Header size='small'><p><b>The Clout DAO is a way for Bitclout users to join the Ethereum DeFi ecosystem.</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content><Header size='small'><p><b>Clout DAO token holders will be able to propose and vote on bitclout based DeFi applications.</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                            <List.Item>
                                                <List.Icon name="ethereum"/>
                                                <List.Content><Header size='small'><p><b>Early CloutBridge creator coin holders will recieve a CloutDAO token airdrop!</b></p></Header></List.Content>
                                            </List.Item>
                                            <List.Item></List.Item>
                                        </List>
                                    </Container>
                                </div>
                            </Container>
                            <div id='smallSpace'/>
                            <p id="heading1">Join the DAO by purchasing the <a href='https://bitclout.com/u/CloutBridge'>CloutBridge</a> creator coin.</p>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider/>
                    <div id='smallSpace'/>
                    <Grid.Row textAlign='center'>
                        <Grid.Column>
                            <Container>
                                <p id="heading1">Product Demonstration Video</p>
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