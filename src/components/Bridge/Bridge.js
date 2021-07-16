import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header, Button, Dropdown, Input } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';

const axios = require('axios');

var mintFee = 10000;

var burnFee = 5000;

class Bridge extends Component{

    state = {connected: 0, connectedContent: <p>loading...</p>, mainContent: <p></p>,
            sendButtonText: "Send", signedBridgeMessage: null,
            lastTime: null, bitcloutBalance: null, ethereumCloutBalance: null, cloutInput: null, dropDownNetwork: null, transferError: null,
            transferAmount: null
        }

    constructor(props){
        super();
        this.props = props;

        setInterval(() => {
            this.evaluateUserConnected();
            this.evaluateUserBridged();
        }, 10000);
    }

    evaluateUserConnected = async () =>{
        
        if(this.props.web3 !== null){

            //console.log("Web3 connected...");
            //console.log(` Eth account: ${this.props.accounts[0]}`)

            if(this.props.network !== 42){
                this.setState({connectedContent: <p>Switch Network to Kovan</p>, connected:0})
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
            var userBridged = await this.props.bitcloutBridge.methods.userBridged(this.props.selectedUser).call();
            //console.log(`   ${this.props.selectedUser} Bridged: ${userBridged}`);

            if(userBridged){
                // Transfer $Clout interface
                this.setState({mainContent: await this.transferCloutComponent()})
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
            headerMessage = <Header size='small'>{this.props.selectedUser} {'<->'} {this.props.accounts[0]}</Header>

            let currentTime = new Date().getTime() / 1000;

            if(this.state.lastTime === null || (currentTime - this.state.lastTime) > 120){
                //console.log(`currentTime ${currentTime} lastTime ${this.state.lastTime} elapsedTime: ${currentTime - this.state.lastTime}`);
                let bitcloutBalance = await axios.get(`/api/getBalance?sender=${this.props.selectedUser}`).then((response)=>{
                    //console.log(response)
                    return response.data.balance / 1000000000;
                });

                let ethereumCloutBalance = await this.props.bitcloutBridge.methods.balanceOf(this.props.accounts[0]).call() / 1000000000;
                
                this.setState({lastTime: currentTime, bitcloutBalance: bitcloutBalance, ethereumCloutBalance: ethereumCloutBalance});
            }
            //console.log(bitcloutBalance);
            
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
                    <p>BitClout to Ethereum Fee: {mintFee/1000000000} $Clout</p>
                    <p>Ethereum to Bitclout Fee: {burnFee/1000000000} $Clout</p>
                    <p>You will recieve: {this.state.transferAmount}</p>
                    <p>{this.state.transferError}</p>
                    <Button onClick={this.handleSend}>{this.state.sendButtonText}</Button>
                    
                </Segment>
                <Segment></Segment>
             </Segment.Group>

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
                        var transactionHex = await axios.get(`/api/createTransaction?sender=${this.props.selectedUser}&amount=${clout}`).then((result)=>{
                            return result.data.transactionHex;
                        })

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

                        this.props.postMessage(signMessage);

                        this.setState({transferError: "Sent $Clout to Ethereum Network! \n Wait for transaction to be added to bitclout blockchain for bridge to occur.", sendButtonText:"Send"});

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
            if(isNaN(Number(cloutValue))){
                this.setState({transferAmount: "NaN"});
                return;
            }
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Ethereum"){
                var transferAmount = ((cloutValue * 1000000000) - mintFee) / 100000000;
                this.setState({transferAmount: transferAmount})
            }
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Bitclout"){
                var transferAmount = ((cloutValue * 1000000000) - burnFee) / 1000000000
                this.setState({transferAmount: transferAmount})
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

        await this.props.bitcloutBridge.methods.unbridgeUser().send({from: this.props.accounts[0]})
    }

    bridgeUserComponent = async () =>{

        var bridgeFee = this.props.web3.utils.fromWei(await this.props.bitcloutBridge.methods.bridgeFee.call().call());
        
        let content = 
         <div>
            <Header size='medium'>Your bitclout address has not been bridged to the ethereum blockchain.</Header>
            <Header size='small'>Confirm you want to bridge the following addresses:</Header>
            <p>{this.props.selectedUser} {'<->'} {this.props.accounts[0]}</p>
            <Button onClick={this.props.handleBridgeRequest}>{this.props.bridgeUserButtonText}</Button>
            <p>Bridge Fee: {bridgeFee} Ether</p>
        </div>
            
        return content;
    }

    bridgeComponent(){

        let content = 
        
            <Segment>
                {this.state.connectedContent}
                {this.state.mainContent}
            </Segment>
        
        ;
        return content;
    }


    render(){

        var bridgeContent = this.bridgeComponent();

        return(
            

                <Segment style={{ padding: '8em 0em' }}>
                    <Container>
                        <Header size='large'> Bridge $CLOUT</Header>
                        {bridgeContent}
                    </Container>
                </Segment>

        );
    }
}

export default Bridge;