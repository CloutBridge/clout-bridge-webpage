import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Menu, Container, Button, Header } from 'semantic-ui-react';

class TopBar extends Component{

    constructor(props){
        super();
        this.props = props;
    }

    render(){

        var networkMessage = this.props.network === 42 ? "Kovan Network" : (this.props.network === 0) ? "" : "Change Network to Kovan Testnet";

        return(
            <Menu borderless fixed='top' size='massive'>
                <Menu.Menu position='right'>
                    <Menu.Item><Header>{networkMessage}</Header></Menu.Item>
                    <Menu.Item ><Button size='small' onClick = {this.props.login}>{this.props.cloutAccount}</Button></Menu.Item>
                    <Menu.Item ><Button size='small' title={this.props.ethAccount} onClick={this.props.updateWeb3}>{this.props.ethAccount}</Button></Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    }
}

export default TopBar;