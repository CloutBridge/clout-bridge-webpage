import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Menu, Button, Header} from 'semantic-ui-react';

import {
    NavLink,
  } from "react-router-dom";

import "./TopBar.css";

import CloutBridgeLogo from "../../logos/newLogo/black/MainLogoAbelTopbar.png";

import CloutBridgeIcon from "../../icons/MainLogoAbelTopbarMobile.png";

import { createMedia } from '@artsy/fresnel';
import { thisTypeAnnotation } from "@babel/types";

const { MediaContextProvider, Media } = createMedia({
    breakpoints: {
      mobile: 0,
      tablet: 768,
      computer: 1024,
    },
  })

const axios = require('axios');

class TopBar extends Component{

    state = {
        exchangePrice: 0,
    }

    constructor(props){
        super();
        this.props = props;
        
        /*
        this.getPrice();
        setInterval(() => {
            this.getPrice();
        }, 20000)*/
    }

    componentDidMount() {
        this.evalutateState();
        this.interval = setInterval( async() =>{
            await this.evalutateState();
        }, 5000);
      }
    
      componentWillUnmount() {
        clearInterval(this.interval);
      }

    evalutateState = async () =>{

        //console.log("evaluate state");

        axios.get(`${this.props.environment}/api/cloutPrice`).then((result)=>{
            //console.log(result.data.USDCentsPerBitCloutExchangeRate)
            this.setState({exchangePrice: Number(result.data.USDCentsPerBitCloutExchangeRate) / 100});
        })

    }

    render(){

        var networkMessage = this.props.network === 5 ? "Goerli Network" : (this.props.network === 0) ? "" : "Change Network to Goerli Testnet";

        var prodMenu = this.props.prod ? <Menu.Menu position='right'>
                                            <Menu.Item></Menu.Item>
                                            <Menu.Item> <Header size='tiny' color='grey'> <p id="cloutPrice">$CLOUT: ${this.state.exchangePrice}</p></Header></Menu.Item>
                                        </Menu.Menu> 
                                       : <Menu.Menu position='right'>
                                            <Menu.Item><Header size='tiny' color='grey'>$CLOUT: ${this.state.exchangePrice}</Header></Menu.Item>
                                            <Menu.Item><Header>{networkMessage}</Header></Menu.Item>
                                            <Menu.Item ><Button size='mini' secondary onClick = {this.props.idModule.login}><div id="OverflowBtn"><p>{this.props.username}</p></div></Button></Menu.Item>
                                            <Menu.Item ><Button size='mini' secondary title={this.props.ethAccount} onClick={this.props.updateWeb3}><div id="OverflowBtn"><p>{this.props.ethAccount}</p></div></Button></Menu.Item>
                                        </Menu.Menu>
        

        return(
            <MediaContextProvider>
                <Media greaterThan='mobile'>
                    <Menu borderless size='massive'>
                        <Menu.Menu position='left'>
                            <Menu.Item icon='sidebar'onClick = {this.props.toggleSideBar}></Menu.Item>
                            <Menu.Item ><NavLink to = "/"><img src={CloutBridgeLogo}/></NavLink></Menu.Item>
                        </Menu.Menu>

                        {prodMenu}
                        <Menu.Menu>
                            <Menu.Item></Menu.Item>
                            <Menu.Item></Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Media>
                <Media at='mobile'>
                    <Menu borderless size='small'>
                        <Menu.Menu position='left'>
                            <Menu.Item icon='sidebar'onClick = {this.props.toggleSideBar}></Menu.Item>
                            <Menu.Item ><NavLink to = "/"><img src={CloutBridgeIcon}/></NavLink></Menu.Item>
                        </Menu.Menu>
                        <Menu.Item position='right'><Header size='tiny' color='grey'>$CLOUT: ${this.state.exchangePrice}</Header></Menu.Item>
                    </Menu>
                </Media>
            </MediaContextProvider>
        );
    }
}

export default TopBar;