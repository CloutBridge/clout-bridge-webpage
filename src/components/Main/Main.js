import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Checkbox,
    Grid,
    Header,
    Icon,
    Image,
    Menu,
    Segment,
    Sidebar,Container} from 'semantic-ui-react';

import "./Main.css";

import farm from "../../icons/FarmIcon.png";

import bridgeIcon from "../../icons/CloutBridgeNewIcon.png";

import { Route, HashRouter, NavLink } from "react-router-dom";

import LaunchPage from "../LaunchPage/LaunchPage.js";

import Bridge from "../Bridge/Bridge.js";


class Main extends Component{

    constructor(props){
        super();
        this.props = props;
    }

    sidebarContent(){
        var content = 
        <div>
            
            <Menu.Item>
                <Grid columns={4}>
                    <Grid.Column><img src={farm} id='farm'/></Grid.Column>
                    <Grid.Column><Header size='large'><p>Farm</p></Header></Grid.Column>
                    <Grid.Column></Grid.Column>
                    <Grid.Column></Grid.Column>
                </Grid>
            </Menu.Item>
            <Menu.Item >
                
            </Menu.Item>
            <Menu.Item >
                <Grid columns={4}>
                    <Grid.Column><Icon name='arrows alternate horizontal' color='black'/></Grid.Column>
                    <Grid.Column><Header size='large'><p>Swap</p></Header></Grid.Column>
                    <Grid.Column></Grid.Column>
                    <Grid.Column></Grid.Column>
                </Grid>
            </Menu.Item>
            <Menu.Item >
                
            </Menu.Item>
            
        </div>

        if(this.props.prod || !this.props.prod){
            console.log("sidbar prod")
            content = <div></div>;
        }



        return content;
    }

    render(){

        var sidebarContent = this.sidebarContent()

        return (
            <div id="mainDiv">
                <Sidebar.Pushable>
                    <Sidebar as={Menu}
                        vertical 
                        borderless 
                        visible={this.props.visible} 
                        animation='overlay'
                        fixed='left'
                        floated
                        >
                        
                        <Menu.Item >
                            
                        </Menu.Item>

                        <Menu.Item >
                            
                        </Menu.Item>
                        
                        <Menu.Item>
                            <NavLink to = "/" >
                                <Grid columns={4}>
                                    <Grid.Column><Icon name='rocket' color='black' size='large'/></Grid.Column>
                                    <Grid.Column><Header size='large'><p>Launch</p></Header></Grid.Column>
                                    <Grid.Column></Grid.Column>
                                    <Grid.Column></Grid.Column>
                                </Grid>
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item >
                            
                        </Menu.Item>

                        <Menu.Item>
                            <NavLink to = "/bridge">
                                <Grid columns={4}>
                                    <Grid.Column><img src={bridgeIcon}/></Grid.Column>
                                    <Grid.Column><Header size='large'><p>Bridge</p></Header></Grid.Column>
                                    <Grid.Column></Grid.Column>
                                    <Grid.Column></Grid.Column>
                                </Grid>
                            </NavLink>
                        </Menu.Item>

                        {sidebarContent}

                        <Menu.Item >
                            <a href="https://clout-bridge.gitbook.io/clout-bridge/"target="_blank">
                                <Grid columns={4}>
                                    <Grid.Column><Icon name='book' color='black' size='large'/></Grid.Column>
                                    <Grid.Column><Header size='large'><p>Docs</p></Header></Grid.Column>
                                    <Grid.Column></Grid.Column>
                                    <Grid.Column></Grid.Column>
                                </Grid>
                            </a>
                        </Menu.Item>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <HashRouter>
                            <Route exact path='/bridge' render = {(routeProps) => (<Bridge handleBridgeRequest = {this.props.handleBridgeRequest} postMessage = {this.props.postMessage} idModule={this.props.idModule}{...routeProps} {...this.props}/>)}/>
                            <Route exact path= '/' render ={(routeProps) => (<LaunchPage {...routeProps}/>)}/>
                        </HashRouter>
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
    
}

export default Main;