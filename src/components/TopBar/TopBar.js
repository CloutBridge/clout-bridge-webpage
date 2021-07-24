import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Menu, Container, Button, Header} from 'semantic-ui-react';

import {
    NavLink,
  } from "react-router-dom";

import "./TopBar.css";

//import BitcloutBrideLogoMini from '../../logos/BitcloutBridgeLogoMini.png';

const axios = require('axios');

class TopBar extends Component{

    state = {
        exchangePrice: 0
    }

    constructor(props){
        super();
        this.props = props;
        setInterval(() => {
            this.getPrice();
        }, 20000)
    }

    getPrice = async ()=>{

        var price = await axios.get(`${this.props.environment}/api/exchangePrice`).then((result)=>{
            //console.log(result.data.USDCentsPerBitCloutExchangeRate)
            return result.data.USDCentsPerBitCloutExchangeRate;
        })

        //console.log(Number(price));
        
        this.setState({exchangePrice: Number(price) / 100});
    }
    

    render(){

        var networkMessage = this.props.network === 42 ? "Kovan Network" : (this.props.network === 0) ? "" : "Change Network to Kovan Testnet";

        var prodMenu = this.props.prod ? <Menu.Menu position='right'></Menu.Menu> 
                                       : <Menu.Menu position='right'>
                                            <Menu.Item><Header size='tiny' color='grey'>$CLOUT Price: {this.state.exchangePrice}</Header></Menu.Item>
                                            <Menu.Item><Header>{networkMessage}</Header></Menu.Item>
                                            <Menu.Item ><Button primary size='small' onClick = {this.props.idModule.login}><div id="OverflowBtn">{this.props.cloutAccount}</div></Button></Menu.Item>
                                            <Menu.Item ><Button primary size='small' title={this.props.ethAccount} onClick={this.props.updateWeb3}><div id="OverflowBtn">{this.props.ethAccount}</div></Button></Menu.Item>
                                        </Menu.Menu>

        return(
            <div>
                <Menu borderless size='massive'>
                    <Menu.Menu position='left'>
                        <Menu.Item icon='sidebar'onClick = {this.props.toggleSideBar}></Menu.Item>
                        
                        <Menu.Item ><NavLink to = "/"><Header><p>CloutBridge</p></Header></NavLink></Menu.Item>
                    </Menu.Menu>
                    
                    {prodMenu}
                </Menu>
                
            </div>
        );
    }
}

export default TopBar;