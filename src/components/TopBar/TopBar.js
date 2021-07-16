import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Menu, Container, Button, Header} from 'semantic-ui-react';

import {
    NavLink,
  } from "react-router-dom";

import "./TopBar.css";

import BitcloutBrideLogoMini from '../../logos/BitcloutBridgeLogoMini.png';

class TopBar extends Component{

    constructor(props){
        super();
        this.props = props;
    }

    render(){

        var networkMessage = this.props.network === 42 ? "Kovan Network" : (this.props.network === 0) ? "" : "Change Network to Kovan Testnet";

        return(
            <div>
                <Menu borderless size='massive'>
                    <Menu.Menu position='left'>
                        <Menu.Item icon='sidebar'onClick = {this.props.toggleSideBar}></Menu.Item>
                        
                        <Menu.Item ><NavLink to = "/"><Header>Clout Bridge</Header></NavLink></Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item><Header>{networkMessage}</Header></Menu.Item>
                        <Menu.Item ><Button size='small' onClick = {this.props.login}><div id="OverflowBtn">{this.props.cloutAccount}</div></Button></Menu.Item>
                        <Menu.Item ><Button size='small' title={this.props.ethAccount} onClick={this.props.updateWeb3}><div id="OverflowBtn">{this.props.ethAccount}</div></Button></Menu.Item>
                    </Menu.Menu>
                    
                </Menu>
                
            </div>
        );
    }
}

export default TopBar;