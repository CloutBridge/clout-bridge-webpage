import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header, Button, Dropdown, Input,Embed, Grid, SegmentGroup, Divider, GridColumn } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';

import demoVideo from '../../demo/CloutBridgeDemoBlue.mp4';

import bridgeIcon from "../../icons/CloutBridgeIcon.png"

import "./Bridge.css";

//import bridgeLogo from "../../logos/CloutBridgeLogo.png"

const axios = require('axios');

var crypto = require("crypto");

var bitcloutTransferFee = 1000;

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

var mintMinimum = 1;

var currentFeeLevel;

class Bridge extends Component{

    state = {connected: 0, connectedContent: <p>loading...</p>, mainContent: <p></p>,
            sendButtonText: "Send", 
            bridgeUserButtonText: "Sign Bridge Message", disableBridgeUserButton: false, disableRemoveMintRequest: false,
            bcltAddressBridged: false, ethAddressBridged: false, accountsLinked: false,
            bitcloutBalance: 0, ethereumCloutBalance: 0, cloutInput: null, dropDownNetwork: null, transferError: null,
            transferAmount: 0,
            countdownDate: new Date("Aug 27, 2021 15:00:00").getTime(), countdownComponent: null,
            bridgeTopMessage: <p id="bridgeHeader"> Bridge CLOUT</p>,
            bridgeFee: 0, mintFee: 0, cloutBridgeFee: 0,
            cloutBridgeBcltBalance: null, bridgedCloutTotalBalance: null,
            
    }

    constructor(props){
        super();
        this.props = props; 

        setInterval(async () => {
            await this.evaluateUserConnected();
            await this.evaluateUserBridged();
            await this.evaluateFees();

            await this.countdown();
        }, 5000);
        
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
                this.setState({connectedContent: <p id="userConnected">Switch Network to Goerli</p>, connected:0})
                return;
            }
            else if(this.props.selectedUser !== null){

                this.setState({connectedContent: <p></p>, connected : 1});

                return;
            }

            this.setState({connectedContent: <p id="userConnected"> Sign-In to Bitclout.</p>, connected : 0});
            return;

        }
        //console.log("Web3 not connected");

        this.setState({connectedContent: <p id="userConnected"> Connect MetaMask Account.</p>, connected : 0});
        return;
    }

    evaluateUserBridged = async () =>{

        if(this.props.web3 !== null && this.state.connected){
            var bcltAddressBridged = await this.props.contractInstance.methods.userBridged(this.props.selectedUser).call();

            var ethAddressBridged = await this.props.contractInstance.methods.userBridged().call({from:this.props.accounts[0]});

            var ethToBcltAddress = await this.props.contractInstance.methods.ethToBcltAddress().call({from: this.props.accounts[0]});

            var accountsLinked = this.props.selectedUser == ethToBcltAddress ? true :  false;

            await this.setState({bcltAddressBridged, ethAddressBridged, accountsLinked});

            let currentTime = new Date().getTime() / 1000;

            if(lastTime === null || (currentTime - lastTime) > 40){
                 //console.log(`currentTime ${currentTime} lastTime ${this.state.lastTime} elapsedTime: ${currentTime - this.state.lastTime}`);
                let bitcloutBalance = await axios.get(`${this.props.environment}/api/getBalance?sender=${this.props.selectedUser}`).then((response)=>{
                    //console.log(response)
                    return response.data.balance / 1000000000;
                });

                let ethereumCloutBalance = await this.props.contractInstance.methods.balanceOf(this.props.accounts[0]).call() / 1000000000;

                var cloutBridgeBcltBalance = await axios.get(`${this.props.environment}/api/cloutBridgeBalance`).then((response)=>{
                    //console.log(response.data);
                    return response.data.cloutBridgeBalance / 1000000000;
                })

                var bridgedCloutTotalBalance = (await this.props.contractInstance.methods.totalSupply().call() / 1000000000).toFixed(9);

                //console.log(` bridgedCloutBalance`)

                lastTime = currentTime;
                
                this.setState({bitcloutBalance, ethereumCloutBalance, cloutBridgeBcltBalance, bridgedCloutTotalBalance});
            }

            //console.log(`   ${this.props.selectedUser} Bridged: bclt ${this.state.bcltAddressBridged} eth ${this.state.ethAddressBridged}`);

            if(bcltAddressBridged && ethAddressBridged && accountsLinked){
                // Transfer $Clout interface
                this.setState({mainContent: await this.transferCloutComponent(), bridgeUserButtonText: "Sign Bridge Message", disableBridgeUserButton: false})
                return;
            }
            // Bridge User interface.
            this.setState({mainContent: await this.bridgeUserComponent()})
        }
        
    }

    evaluateFees = async() =>{
        if(this.props.web3 !== null){
            var currentGasPrice = Number(await this.props.web3.eth.getGasPrice());

            //console.log(currentGasPrice) 5000000000

            currentFeeLevel = currentGasPrice <= gasPrices.low   ? "low" : 
                                 (currentGasPrice <= gasPrices.med)  ? "med" : 
                                 (currentGasPrice <= gasPrices.high) ? "high": 
                               (currentGasPrice <= gasPrices.higher) ? "higher" :
                               (currentGasPrice <= gasPrices.extreme)? "extreme": "unbearable";

            

            this.setState({bridgeFee: (Number(gas.bridge) * Number(gasPrices[currentFeeLevel])), mintFee: (Number(gas.mint) * Number(gasPrices[currentFeeLevel])) });
        }
    }


    transferCloutComponent = async () =>{

        const options =[
            {key:"Ethereum", text: "Ethereum", value:"Ethereum"},
            {key:"Bitclout", text: "Bitclout", value:"Bitclout"},
        ]

        var headerMessage, mainSegment, unbridge;

        headerMessage = 
            <p id='bridgeUserText'>             
                <b>{this.props.selectedUser}</b> : <b>{this.props.accounts[0]}</b>
            </p>

        //console.log(bitcloutBalance);
        try{
            var sendButton;
            var requestMintButton = <div></div>
            var feeText;
            if(this.state.dropDownNetwork !== null){
                if(this.state.dropDownNetwork == 'Ethereum'){
                    var viewMintRequest = await this.props.contractInstance.methods.viewMintRequest().call({from: this.props.accounts[0]});
                    requestMintButton = Number(viewMintRequest) > 0 ? <Button disabled>bClout Mint Requested</Button> 
                                                                    : <Button onClick={this.mintRequest}>Request bClout Mint</Button>;
                    sendButton = Number(viewMintRequest) < Number(gas.mint * gasPrices[currentFeeLevel]) 
                                                         ? <Button disabled>{this.state.sendButtonText}</Button> 
                                                         : <Button onClick={this.handleSend}>{this.state.sendButtonText}</Button>;
                    feeText = <p>Bitclout to Ethereum Fee: {this.props.web3.utils.fromWei(this.state.mintFee.toString(), 'ether')} ether + {' '}
                    {Number((Number(this.state.cloutBridgeFee)) / 1000000000).toFixed(9)} $Clout</p>
                }
                if(this.state.dropDownNetwork == 'Bitclout'){
                    sendButton = <Button onClick={this.handleSend}>{this.state.sendButtonText}</Button>
                    feeText = <p>Ethereum to Bitclout Fee: {Number((Number(this.state.cloutBridgeFee) + Number(bitcloutTransferFee)) / 1000000000).toFixed(9)} $Clout</p>
                }
            }

            //MainSegment
            var buttonSection = <div>
                                    {requestMintButton}
                                    {sendButton}
                                </div>;


            mainSegment = 
                    <div id='transferSegment'>
                        <div id='bridgeUserText'>
                            <Header size="tiny"> Account Balances:</Header>
                            <p>$CLOUT Balance: {Number(this.state.bitcloutBalance).toFixed(9)}</p>
                            <p>$bCLOUT Balance: {Number(this.state.ethereumCloutBalance).toFixed(9)}</p>
                            <Divider></Divider>
                            <Header size="tiny"> Transfer</Header>
                            <p>
                            To:{' '}
                            <Dropdown button inline selection placeholder={options[0]} options={options} onChange= {this.changeNetwork}/>
                            Amount:{' '}
                            <Input size='mini' placeholder="$Clout..." onChange={this.changeInput}/>
                            </p>
                            <Divider></Divider>
                            {feeText}
                            <p>You will recieve: {(Number(this.state.transferAmount) / 1000000000).toFixed(9)}</p>
                            <p>{this.state.transferError}</p>
                            {buttonSection}
                            <p style={{'margin-top': "2vh"}}>Current Fee Level: {currentFeeLevel}</p>
                        </div>
                    </div>

        }catch(err){
            console.log(err)
        }
        
        unbridge = <div id='userUnbridge'>
                        <p>In the case that you would like to unbridge your accounts select the button bellow.</p>
                        <Button inverted secondary onClick={this.unbridgeUser}>Unbridge Account.</Button>
                    </div>

        let content = 
                    <div>
                        {headerMessage}

                        {mainSegment}

                        {unbridge}
                    </div>
            
        return content;
    }

    mintRequest = async () =>{
        try{
            await this.props.contractInstance.methods.mintRequest().send({from: this.props.accounts[0], value: this.state.mintFee});
        }catch(err){
            console.log(`Mint Request Error`, err)
        }
    }

    handleSend = async () =>{
        //console.log("handle Send");
        this.setState({sendButtonText: "Sending..."});
        try{
            if(this.state.cloutInput === null || isNaN(Number(this.state.cloutInput))){
                this.setState({transferError: "Invalid $Clout amount.", sendButtonText:"Send"});
                return;
            }
            if(this.state.dropDownNetwork !== null){
                if(this.state.dropDownNetwork === "Ethereum"){
                    await this.transferToEthereum();
                }
                else{
                    await this.transferToBitclout();
                }
            }
            else{
                this.setState({transferError: "Set Network To Transfer $Clout to."});
            }

        }catch(error){
            console.log(error);
        }
    }

    transferToEthereum = async () => {
        console.log(`Send ${clout} nanos`);
        var clout = parseFloat(this.state.cloutInput) * 1000000000;
        if(clout > Number(this.state.bitcloutBalance) * 1000000000){
            this.setState({transferError: "Not enough $clout on bitclout network to send.", sendButtonText:"Send"});
            return;
        }
        if(clout < mintMinimum){
            this.setState({transferError: "Not enough $Clout entered to meet minimum transfer.", sendButtonText:"Send"});
            return;
        }
        console.log("Trasfer to Ethereum")
        try{
            var transactionHex = await axios.get(`${this.props.environment}/api/createTransaction?sender=${this.props.selectedUser}&amount=${clout}`).then((result)=>{
                return result.data.transactionHex;
            })

            this.props.idModule.approve(transactionHex);

            this.setState({transferError: "Attemping to send $Clout to Ethereum Network. \n Wait for transaction to be added to bitclout blockchain for bridge to occur.", sendButtonText:"Send"});

        }catch(error){
            console.log("Bitclout transfer Error. \n" + error)
        }

    }

    transferToBitclout = async () =>{
        console.log(`Send ${clout} nanos`);
        var clout = parseFloat(this.state.cloutInput) * 1000000000;
        console.log("Transfer to Bitclout");
        if(clout > Number(this.state.ethereumCloutBalance) * 1000000000){
            this.setState({transferError: "Not enough $clout on ethereum network to send.", sendButtonText:"Send"});
            return;
        }
        if(clout - bitcloutTransferFee <= 0){
            this.setState({transferError: "Not enough $Clout entered to cover transfer fee.", sendButtonText:"Send"});
            return;
        }
        var minimumBurn = await this.props.contractInstance.methods.minimumBurn.call().call()
        if(clout < minimumBurn){
            this.setState({transferError: "Not enough $Clout entered to meet minimum transfer.", sendButtonText:"Send"});
        }
        //var ethBurnFee = await this.props.contractInstance.methods.burnFee.call().call();
        //console.log(`Ether burn fee: ${ethBurnFee}`);
        
        
        await this.props.contractInstance.methods.burn(clout).send({from: this.props.accounts[0]})
    }

    handleRecieveText = async (cloutValue) =>{

        if(cloutValue !== "" && cloutValue !== null){
            //console.log(cloutValue)
            if(isNaN(Number(cloutValue))){
                this.setState({transferAmount: "NaN"});
                return;
            }
            var transferAmount;
            var cloutBridgeFee = Math.floor((cloutValue * 1000000000) * .01);
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Ethereum"){
                transferAmount = (Math.floor((cloutValue * 1000000000) * .99));
            }
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Bitclout"){
                transferAmount = (Math.floor((cloutValue * 1000000000) * .99) - bitcloutTransferFee);
            }
            this.setState({transferAmount: transferAmount > 0 ? transferAmount: 0, cloutBridgeFee: cloutBridgeFee})
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
            await this.props.contractInstance.methods.unbridgeUser().send({from: this.props.accounts[0]})
        }
        catch(err){
            console.log("unbridge error")
        }

    }

    removeMintRequest = async () =>{

        try{

            await this.props.contractInstance.methods.removeMintRequest().send({from: this.props.accounts[0]});

        }catch(err){
            console.log("remove mint Request error", err)
        }

    }

    bridgeUserComponent = async () =>{

        var web3 = this.props.web3;

        this.setState({bridgeTopMessage: <p id="bridgeHeader">Bridge Accounts</p>})

        if(!this.state.ethAddressBridged && !this.state.bcltAddressBridged){
            
            var btn = this.state.disableBridgeUserButton
                        ? <Button disabled >{this.state.bridgeUserButtonText}</Button>
                        : <Button onClick={this.handleBridgeRequest}>{this.state.bridgeUserButtonText}</Button>;
            
            let content = 
            <div id='bridgeUserText'>
                <Header size='medium'>Your bitclout address has not been bridged to the ethereum blockchain.</Header>
                <Header size='small'>Confirm you want to bridge the following addresses:</Header>
                <Container textAlign='left'>
                    <p style={{'margin-left': '10vw'}}>Bitclout Address: {this.props.selectedUser}</p>
                    <p style={{'margin-left': '10vw'}}>Ethereum Address: {this.props.accounts[0]}</p>
                </Container>
                <div id ='userBridge'>
                    {btn}
                    <p>Bridge Fee: {this.props.web3.utils.fromWei(this.state.bridgeFee.toString(), "ether")} Ether</p>
                </div>
            </div>
                
            return content;
        }

        if(this.state.ethAddressBridged){

            var mintRequest = await this.props.contractInstance.methods.viewMintRequest().call({from: this.props.accounts[0]});

            var unbridgeButton = mintRequest > 0 ? <div>
                                                    <Button inverted secondary onClick={this.removeMintRequest}>Remove Mint Request.</Button>
                                                    <p>You have a pending mint request of, {web3.utils.fromWei(mintRequest,'ether')} ether. Click above to remove it if you want to unbridge your Account.</p>
                                                   </div>
                                                 : <Button inverted secondary onClick={this.unbridgeUser}>Unbridge Account.</Button>;

            let content = <div id='bridgeUserText'>
                            <p>Your ethereum address, {this.props.accounts[0]} is already bridged.</p>
                            <p> <b>But NOT to:</b> {this.props.selectedUser}</p>
                            <p> Sign-In to the correct Bitclout Account or unbridge your ethereum address.</p>
                            <div id='userUnbridge'>{unbridgeButton}</div>
                          </div>
        
            return content;
        }

        let content = <div id='bridgeUserText'>
                        <p>Your bitclout address, {this.props.selectedUser} is already bridged.</p>
                        <p> <b>But NOT to:</b> {this.props.accounts[0]}</p>
                        <p> Connect to the correct Ethereum Account to start transfering Clout.</p>
                     </div>

        return content;
        
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
            
            var bridgeFee = await this.props.contractInstance.methods.bridgeFee.call().call()
    
            var bridgeGas = await this.props.contractInstance.methods.bridgeRequest(JSON.stringify(payload)).estimateGas({from: this.props.accounts[0], value: bridgeFee});
        
            console.log(`Bridge Gas : ${bridgeGas}, Bridge Fee: ${bridgeFee}`)
    
            var bridge = await this.props.contractInstance.methods.bridgeRequest(JSON.stringify(payload)).send({from: this.props.accounts[0], value: bridgeFee});

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

    transparencyComponent (){

        let content = <Container textAlign='center'>
                            <div id='transparencyComponent'>
                                <p id='transparencyHeader'>CloutBridge Network Balances</p>
                                <Container>
                                    <Grid columns={4}>
                                        <Grid.Row>
                                            <Grid.Column></Grid.Column>
                                            <Grid.Column><p id='transparencyContent'>Bitclout $CLOUT: {this.state.cloutBridgeBcltBalance}</p> </Grid.Column>
                                            <Grid.Column><p id='transparencyContent'>Ethereum $bCLOUT: {this.state.bridgedCloutTotalBalance}</p></Grid.Column>
                                            <Grid.Column></Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Container>
                            </div>
                      </Container>
        return content;
    }


    render(){

        var transparencyComponent = this.transparencyComponent();

        var mainContent = this.bridgeComponent();

        var topMessage = this.state.bridgeTopMessage;

        
        if(this.props.prod){
            //console.log(`Bridge prod`);
            mainContent = this.embededComponent();
            topMessage = this.state.countdownComponent; //<Header size='large'>Bridge $CLOUT Demo</Header>
            transparencyComponent = <div></div>
        }

        return(

            <Segment style={{overflow:'auto', maxHeight:"92.25vh", padding: '6em 0em' }}>
                {transparencyComponent}
                <div id='spacer'></div>
                <Container textAlign='center'>
                    <div id='bridgeSegment'>
                        {topMessage}
                        {mainContent}
                    </div>
                </Container>
            </Segment>
        );
    }
}

export default Bridge;