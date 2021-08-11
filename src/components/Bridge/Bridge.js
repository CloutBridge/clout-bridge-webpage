import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header, Button, Dropdown, Input,Embed, Grid, SegmentGroup } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';

import VideoLooper from 'react-video-looper'

import demoVideo from '../../demo/CloutBridgeDemoBlue.mp4';

import bridgeIcon from "../../icons/CloutBridgeIcon.png"

import "./Bridge.css";

//import bridgeLogo from "../../logos/CloutBridgeLogo.png"

const axios = require('axios');

var crypto = require("crypto");

var mintFee = 10000;

var burnFee = 5000;

var lastTime = null;

var gasPrices = {
    low: 75000000000,
    med: 150000000000,
    high: 350000000000,
    higher: 500000000000,
    extreme: 1000000000000,
    unbearable: 10000000000000
};

var gas ={
    bridge: 117404,
    mint: 80032
}


class Bridge extends Component{

    state = {connected: 0, connectedContent: <p>loading...</p>, mainContent: <p></p>,
            sendButtonText: "Send", 
            bridgeUserButtonText: "Sign Bridge Message", disableBridgeUserButton: false,
            bcltAddressBridged: false, ethAddressBridged: false,
            bitcloutBalance: 0, ethereumCloutBalance: 0, cloutInput: null, dropDownNetwork: null, transferError: null,
            transferAmount: 0,
            countdownDate: new Date("Aug 27, 2021 15:00:00").getTime(), countdownComponent: null
        }

    constructor(props){
        super();
        this.props = props; 

        setInterval(() => {
            this.evaluateUserConnected();
            this.evaluateUserBridged();
            this.countdown();
        }, 1000);
    }

    countdown = async () =>{
        var currentTime = new Date().getTime();
        var distance = this.state.countdownDate - currentTime;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var content = 
            <Container>
                <p id='launchText'>Launching In...</p>
                <p id='launchCountdown'>{days}d {hours}h {minutes}m {seconds}s</p>
            </Container>
        ;
        this.setState({countdownComponent: content});
    }

    evaluateUserConnected = async () =>{
        
        if(this.props.web3 !== null){

            //console.log("Web3 connected...");
            //console.log(` Eth account: ${this.props.accounts[0]}`)

            if(this.props.network !== 5){
                this.setState({connectedContent: <p>Switch Network to Goerli</p>, connected:0})
                return;
            }
            else if(this.props.selectedUser !== null){

                this.setState({connectedContent: <p></p>, connected : 1});

                return;
            }

            this.setState({connectedContent: <p> Sign-In to Bitclout.</p>, connected : 0});
            return;

        }
        //console.log("Web3 not connected");

        this.setState({connectedContent: <p> Connect MetaMask Account.</p>, connected : 0});
        return;
    }

    evaluateUserBridged = async () =>{

        if(this.props.web3 !== null && this.state.connected){
            var bcltAddressBridged = await this.props.bitcloutBridge.methods.userBridged(this.props.selectedUser).call();

            var ethAddressBridged = await this.props.bitcloutBridge.methods.userBridged().call({from:this.props.accounts[0]});

            this.setState({bcltAddressBridged: bcltAddressBridged, ethAddressBridged: ethAddressBridged});

            //console.log(`   ${this.props.selectedUser} Bridged: ${userBridgedB} ${userBridgeA}`);

            if(bcltAddressBridged && ethAddressBridged){
                // Transfer $Clout interface
                this.setState({mainContent: await this.transferCloutComponent(), bridgeUserButtonText: "Sign Bridge Message", disableBridgeUserButton: false})
                return;
            }
            // Bridge User interface.
            this.setState({mainContent: await this.bridgeUserComponent()})
        }

    }

    transferCloutComponent = async () =>{

        const options =[
            {key:"Ethereum", text: "Ethereum", value:"Ethereum"},
            {key:"Bitclout", text: "Bitclout", value:"Bitclout"},
        ]

        var bcltBridgedAccount  = await this.props.bitcloutBridge.methods.bcltToEthAddress(this.props.selectedUser).call();

        var bridgedAccountsCorrect = bcltBridgedAccount === this.props.accounts[0] ? true : false;

        var headerMessage, mainSegment, unbridge;

        if(bridgedAccountsCorrect){
            headerMessage = 
                <p>             
                    <b>{this.props.selectedUser}</b> <img src={bridgeIcon}/> <b>{this.props.accounts[0]}</b>
                </p>

            let currentTime = new Date().getTime() / 1000;

            if(lastTime === null || (currentTime - lastTime) > 120){
                console.log(`currentTime ${currentTime} lastTime ${this.state.lastTime} elapsedTime: ${currentTime - this.state.lastTime}`);
                let bitcloutBalance = await axios.get(`${this.props.environment}/api/getBalance?sender=${this.props.selectedUser}`).then((response)=>{
                    //console.log(response)
                    return response.data.balance / 1000000000;
                });

                let ethereumCloutBalance = await this.props.bitcloutBridge.methods.balanceOf(this.props.accounts[0]).call() / 1000000000;

                lastTime = currentTime;
                
                this.setState({bitcloutBalance: bitcloutBalance, ethereumCloutBalance: ethereumCloutBalance});
            }
            //console.log(bitcloutBalance);

            try{
                mainSegment = 
                    <Segment.Group horizontal>
                        <Segment></Segment>
                        <Segment raised>
                            <Header size="tiny"> Account Balances:</Header>
                            <p>Bitclout Network Balance: {this.state.bitcloutBalance.toFixed(9)}</p>
                            <p>Ethereum Network Balance: {this.state.ethereumCloutBalance.toFixed(9)}</p>
                            <p>
                            Transfering to:{' '}
                            <Dropdown button inline selection placeholder={options[0]} options={options} onChange= {this.changeNetwork}/>
                            Amount:{' '}
                            <Input placeholder="$Clout..." onChange={this.changeInput}/>
                            </p>
                            <p>Bitclout to Ethereum Fee: {mintFee/1000000000} $Clout</p>
                            <p>Ethereum to Bitclout Fee: {burnFee/1000000000} $Clout</p>
                            <p>You will recieve: {this.state.transferAmount}</p>
                            <p>{this.state.transferError}</p>
                            <Button onClick={this.handleSend}>{this.state.sendButtonText}</Button>
                            
                        </Segment>
                        <Segment></Segment>
                    </Segment.Group>

            }catch(err){
                console.log(err)
            }
            

            unbridge = <Button inverted secondary onClick={this.unbridgeUser}>Unbridge Account.</Button>
        }
        else{
            headerMessage = <Header size='small'>Invalid Eth Address for {this.props.selectedUser}</Header>
            mainSegment = null;
            unbridge = null;
        }


        let content = 
            <Segment.Group border>
                <Segment>
                    <Header size='medium'>Bridge $CLOUT between following accounts:</Header>
                    {headerMessage}
                </Segment>
                {mainSegment}
                <Segment>
                    {unbridge}
                </Segment>
            </Segment.Group>
            
        return content;

    }

    handleSend = async () =>{

        //console.log("handle Send");

        this.setState({sendButtonText: "Sending..."});
        
        try{
            if(this.state.cloutInput === null || isNaN(Number(this.state.cloutInput))){
                this.setState({transferError: "Invalid $Clout amount.", sendButtonText:"Send"});
                return;
            }
            var clout = parseFloat(this.state.cloutInput) * 1000000000;

            console.log(`Send ${clout} nanos`);

            if(this.state.dropDownNetwork !== null){
                if(this.state.dropDownNetwork === "Ethereum"){
                    if(clout > Number(this.state.bitcloutBalance) * 1000000000){
                        this.setState({transferError: "Not enough $clout on bitclout network to send.", sendButtonText:"Send"});
                        return;
                    }
                    if( clout - mintFee <= 0){
                        this.setState({transferError: "Not enough $Clout entered to cover bridge fee.", sendButtonText:"Send"});
                        return;
                    }
                    console.log("Trasfer to Ethereum")
                    try{
                        var transactionHex = await axios.get(`${this.props.environment}/api/createTransaction?sender=${this.props.selectedUser}&amount=${clout}`).then((result)=>{
                            return result.data.transactionHex;
                        })

                        /*
                        var signMessage = {
                            id: uuidv4(),
                            service: 'identity',
                            method: 'sign',
                            payload:{
                                accessLevel: 4,
                                accessLevelHmac: this.props.accessLevelHmac,
                                encryptedSeedHex: this.props.encryptedSeedHex,
                                transactionHex: transactionHex
                            }
                        }

                        console.log(JSON.stringify(signMessage))

                        this.props.postMessage(signMessage);*/

                        this.props.idModule.approve(transactionHex)

                        this.setState({transferError: "Attemping to send $Clout to Ethereum Network. \n Wait for transaction to be added to bitclout blockchain for bridge to occur.", sendButtonText:"Send"});

                    }catch(error){
                        console.log("Bitclout transfer Error. \n" + error)
                    }
                }
                else{
                    console.log("Transfer to Bitclout");
                    if(clout > Number(this.state.ethereumCloutBalance) * 1000000000){
                        this.setState({transferError: "Not enough $clout on ethereum network to send.", sendButtonText:"Send"});
                        return;
                    }
                    if(clout - burnFee <= 0){
                        this.setState({transferError: "Not enough $Clout entered to cover bridge fee.", sendButtonText:"Send"});
                        return;
                    }
                    var ethBurnFee = await this.props.bitcloutBridge.methods.burnFee.call().call();
                    console.log(`Ether burn fee: ${ethBurnFee}`);
                    await this.props.bitcloutBridge.methods.burn(clout).send({from: this.props.accounts[0], value: ethBurnFee})
                }
            }
            else{
                this.setState({transferError: "Set Network To Transfer $Clout to."});
            }

        }catch(error){
            console.log(error);
        }
    }

    handleRecieveText = async (cloutValue) =>{

        if(cloutValue !== "" && cloutValue !== null){
            //console.log(cloutValue)
            if(isNaN(Number(cloutValue))){
                this.setState({transferAmount: "NaN"});
                return;
            }
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Ethereum"){
                var transferAmount = ((cloutValue * 1000000000) - mintFee) / 1000000000;
                this.setState({transferAmount: transferAmount > 0 ? transferAmount: 0})
            }
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Bitclout"){
                var transferAmount = ((cloutValue * 1000000000) - burnFee) / 1000000000;
                this.setState({transferAmount: transferAmount > 0 ? transferAmount: 0})
            }
        }
    }

    changeNetwork = async (event, {value}) =>{
        this.setState({dropDownNetwork: value});
        this.handleRecieveText(this.state.cloutInput);
    }

    changeInput = async (event) => {
        
        this.setState({cloutInput: event.target.value});
        this.handleRecieveText(event.target.value);
    }

    unbridgeUser = async () =>{
        console.log("unbridging account");
        try{
            this.setState({disableBridgeUserButton: false, bridgeUserButtonText: this.props.signedBridgeMessage === null ?"Sign Bridge Message" : "Bridge User Accounts"});
            await this.props.bitcloutBridge.methods.unbridgeUser().send({from: this.props.accounts[0]})
        }
        catch(err){
            console.log("unbridge error")
        }

    }

    bridgeUserComponent = async () =>{

        if(this.state.ethAddressBridged && this.state.bcltAddressBridged){
            var bridgeFee = await this.calculateBridgeFee();
            
            var btn = this.state.disableBridgeUserButton
                        ? <Button disabled >{this.state.bridgeUserButtonText}</Button>
                        : <Button onClick={this.handleBridgeRequest}>{this.state.bridgeUserButtonText}</Button>;
            
            let content = 
            <div>
                <Header size='medium'>Your bitclout address has not been bridged to the ethereum blockchain.</Header>
                <Header size='small'>Confirm you want to bridge the following addresses:</Header>
                <p>{this.props.selectedUser} <img src={bridgeIcon}/> {this.props.accounts[0]}</p>
                {btn}
                <p>Bridge Fee: {bridgeFee} Ether</p>
            </div>
                
            return content;

        }
        
    }

    calculateBridgeFee = async () =>{

        var currentGasPrice = await this.props.web3.eth.getGasPrice();

        var currentFeeLevel = currentGasPrice <= gasPrices.low   ? "low" : 
                             (currentGasPrice <= gasPrices.med)  ? "med" : 
                             (currentGasPrice <= gasPrices.high) ? "high": 
                           (currentGasPrice <= gasPrices.higher) ? "higher" :
                           (currentGasPrice <= gasPrices.extreme)? "extreme": "unbearable";

        //console.log(gas.bridge * gasPrices[currentFeeLevel]);


        return this.props.web3.utils.fromWei((gas.bridge * gasPrices[currentFeeLevel]).toString(), 'ether');
    }

    handleBridgeRequest = async () =>{

        console.log("handle bridge request.")
        if(this.props.signedBridgeMessage === null){
            console.log("no signed message")
            await this.signBridgeMessageRequest();
            this.setState({bridgeUserButtonText : "Bridge User Accounts"})
            return;
        }
    
        var bridgeMessage = this.props.selectedUser + "<->" + this.props.accounts[0];
    
        var payload = {
          message: bridgeMessage,
          userSignature: Buffer.from(this.props.signedBridgeMessage, 'hex')
        }
    
        //console.log(JSON.stringify(payload));
    
        //await this.testRequest(JSON.stringify(payload))

        try{
            this.setState({disableBridgeUserButton: true, bridgeUserButtonText: "Bridging Accounts, Please wait shortly."});
            
            var bridgeFee = await this.props.bitcloutBridge.methods.bridgeFee.call().call()
    
            var bridgeGas = await this.props.bitcloutBridge.methods.bridgeRequest(JSON.stringify(payload)).estimateGas({from: this.props.accounts[0], value: bridgeFee});
        
            console.log(`Bridge Gas : ${bridgeGas}, Bridge Fee: ${bridgeFee}`)
    
            var bridge = await this.props.bitcloutBridge.methods.bridgeRequest(JSON.stringify(payload)).send({from: this.props.accounts[0], value: bridgeFee});

            console.log(bridge);

        }catch(err){
            console.log("error")
            this.setState({disableBridgeUserButton: false, bridgeUserButtonText:"Bridge User Accounts"})
        }
      }

    signBridgeMessageRequest = async () =>{

        var bridgeMessage = this.props.selectedUser + "<->" + this.props.accounts[0];

        console.log(bridgeMessage)
    
        var bridgeMessageHash = crypto.createHash("sha256").update(bridgeMessage).digest();
    
        console.log(bridgeMessageHash.toString('hex'));
    
        var newId = uuidv4();
    
        var message = {
          id: newId,
          service: 'identity',
          method: 'burn',
          payload: {
            accessLevel: 4,
            accessLevelHmac: this.props.accessLevelHmac,
            encryptedSeedHex: this.props.encryptedSeedHex,
            unsignedHashes: [ bridgeMessageHash ]
          },
        }
    
        this.props.idModule.postMessage(message);
      }

    bridgeComponent(){

        let content = 
        
            <div>
                {this.state.connectedContent}
                {this.state.mainContent}
            </div>
        
        ;
        return content;
    }

    embededComponent(){
        let content = 
            <div>
                {/*<Embed id='_GoLWGzko8s' source='youtube' placeholder={bridgeLogo} ></Embed>*/}
                {/*<VideoLooper source={demoVideo} width='110%' height='67.5vh' start={0} end={99} loopCount={20}/>*/}
            </div>
            ;
        return content
    }

    render(){

        var topMessage = <p id="bridgeHeader"> Bridge CLOUT</p>
        var mainContent = this.bridgeComponent();

        if(this.props.prod){
            console.log(`Bridge prod`);
            mainContent = this.embededComponent();
            topMessage = this.state.countdownComponent; //<Header size='large'>Bridge $CLOUT Demo</Header>
        }

        return(

            <Segment style={{ padding: '8em 0em' }}>
                <Container>
                    <Segment style={{ padding: '8em 0em' }}>
                        {topMessage}
                        {mainContent}
                    </Segment>
                </Container>
            </Segment>
        );
    }
}

export default Bridge;