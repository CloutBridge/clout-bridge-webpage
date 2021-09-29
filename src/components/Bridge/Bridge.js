import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header, Button, Dropdown, Input, Grid, Divider, } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';

import "./Bridge.css";

//import bridgeLogo from "../../logos/CloutBridgeLogo.png"

const axios = require('axios');

var crypto = require("crypto");

var bitcloutTransferFee = 1000;

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

var mintMinimum = 100000000;

var currentFeeLevel;

var oneClout = 1000000000;

var ethChainDomain =  "https://polygonscan.com/tx/";//"https://goerli.etherscan.io/tx/";

var cloutChainDomin = "https://explorer.bitclout.com/?query-node=https:%2F%2Fapi.bitclout.com&public-key="

class Bridge extends Component{

    state = {connectedContent: <p>loading...</p>, mainContent: <p></p>,
            sendButtonText: "Send", 
            bridgeTransactionText: "", disableRemoveMintRequest: false, disableBridgeUserButton: false,
            bcltAddressBridged: false, ethAddressBridged: false, accountsLinked: false, bridgeOpen: false, currentGasPrice: null,
            bitcloutBalance: 0, ethereumCloutBalance: 0, cloutInput: null, dropDownNetwork: null, transferError: null,
            transferAmount: 0,
            countdownDate: new Date("Sep 3, 2021 22:00:00").getTime(), countdownComponent: null,
            bridgeFee: 0, mintFee: 0, cloutBridgeFee: 0,
            cloutBridgeBcltBalance: null, bridgedCloutTotalBalance: null, bitcloutUser: null,
            transactionText: <p></p>
    }

    constructor(props){
        super();
        this.props = props;
    }

    componentDidMount() {
        if(this.props.prod){
            this.countdown();
            this.interval = setInterval( async() =>{
                await this.countdown();
            }, 1000);
            return;
        }
        else{
            this.evaluateUserConnected()
            this.interval = setInterval( async() =>{
                
                await this.evaluateUserConnected();    
            }, 5000);
        }
      }
    
      componentWillUnmount() {
        clearInterval(this.interval);
      }

    countdown = async () =>{
        /*
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
        this.setState(() => ({countdownComponent: content}));*/

        var content = <Container>
                        <p style ={{'font-size': '14pt'}}>Bridge Closed For Token Rebranding...</p>
                      </Container>

        this.setState(() => ({countdownComponent: content}))
    }

    evaluateUserConnected = async () =>{
        
        if(this.props.web3 !== null){

            //console.log("Web3 connected...");
            //console.log(` Eth account: ${this.props.accounts[0]}`)

            if(this.props.network !== 5 && this.props.network !== 137){
                this.setState({connectedContent: <p id="userConnected">Switch Network to Polygon</p>})
                return;
            }
            else if(this.props.selectedUser !== null){

                if(this.props.selectedUser !== this.state.bitcloutUser){
                    this.setState(() => ({bitcloutUser: this.props.selectedUser, transferError: null, sendDisabled: false, transactionText: null}));
                }

                //console.log("Connected");

                this.setState(() => ({connectedContent: <p></p>}));

                await this.evaluateEthereumState();

                await this.evaluateBridged();

                await this.evaluateBitcloutState();

                //await this.evaluateFees();
                return;
            }

            this.setState(() => ({connectedContent: <p id="userConnected"> Sign-In to Bitclout.</p>}));
            return;
        }
        //console.log("Web3 not connected");

        this.setState(() => ({connectedContent: <p id="userConnected"> Connect MetaMask Account.</p>}));
        return;
    }

    
    evaluateEthereumState = async () =>{
        
        var ethereumCalls = [];

        ethereumCalls.push(this.props.contractInstance.methods.userBridged(this.props.selectedUser).call());
        ethereumCalls.push(this.props.contractInstance.methods.userBridged().call({from:this.props.accounts[0]}));
        ethereumCalls.push(this.props.contractInstance.methods.ethToBcltAddress().call({from: this.props.accounts[0]}));
        ethereumCalls.push(this.props.contractInstance.methods.balanceOf(this.props.accounts[0]).call());
        ethereumCalls.push(this.props.contractInstance.methods.totalSupply().call());
        ethereumCalls.push(this.props.web3.eth.getGasPrice());
        ethereumCalls.push(this.props.contractInstance.methods.bridgeState.call().call());
        ethereumCalls.push(this.props.contractInstance.methods.bridgeFee.call().call());
        ethereumCalls.push(this.props.contractInstance.methods.mintFee.call().call());

        var bcltAddressBridged = await ethereumCalls[0];

        var ethAddressBridged = await ethereumCalls[1];

        var ethToBcltAddress = await ethereumCalls[2];

        var ethereumCloutBalance = Number(await ethereumCalls[3] / oneClout).toFixed(9);;

        var bridgedCloutTotalBalance =  Number(await ethereumCalls[4] / oneClout).toFixed(9);

        var currentGasPrice =  Number(await ethereumCalls[5]);

        var bridgeOpen = await ethereumCalls[6];

        var bFee = await ethereumCalls[7];

        var mFee = await ethereumCalls[8];
        
        currentFeeLevel = currentGasPrice <= gasPrices.low   ? "low" : 
                         (currentGasPrice <= gasPrices.med)  ? "med" : 
                         (currentGasPrice <= gasPrices.high) ? "high": 
                       (currentGasPrice <= gasPrices.higher) ? "higher" :
                       (currentGasPrice <= gasPrices.extreme)? "extreme": "unbearable";

        var bridgeFee =  this.props.network === 137 ? Number(bFee) : (Number(gas.bridge) * Number(gasPrices[currentFeeLevel]));
        var mintFee = this.props.network === 137 ? Number(mFee) : (Number(gas.mint) * Number(gasPrices[currentFeeLevel]))

        //console.log(bridgeFee);
        
        var accountsLinked = this.props.selectedUser.toString() === ethToBcltAddress.toString() ? true :  false;

        //console.log(` bcltAddressBridged: ${bcltAddressBridged},  ethAddressBridged:${ethAddressBridged}, ethToBcltAddress:${ethToBcltAddress}, ethereumCloutBalance:${ethereumCloutBalance}, bridgedCloutTotalBalance:${bridgedCloutTotalBalance}`)

        this.setState(() => ({bridgeFee, mintFee,
            bcltAddressBridged, ethAddressBridged, ethToBcltAddress, ethereumCloutBalance, bridgedCloutTotalBalance, accountsLinked, bridgeOpen, currentGasPrice
        }));
        
    }

    evaluateBitcloutState = async () =>{

        

        await axios.get(`${this.props.environment}/api/cloutBridgeBalance`).then((response)=>{
            //console.log(response.data)
            this.setState({cloutBridgeBcltBalance : (response.data.cloutBridgeBalance / 1000000000)});
            //console.log("cloutBridgeBalance:",this.state.cloutBridgeBcltBalance);
        })

        await axios.get(`${this.props.environment}/api/getBalance?sender=${this.props.selectedUser}`).then((response)=>{
            //console.log(response)
            this.setState({bitcloutBalance : (response.data.balance / 1000000000)});
            //console.log(this.state.bitcloutBalance);
        });
        
    }

    evaluateBridged = async () =>{

        if(!this.state.bridgeOpen){
            this.setState({mainContent: <p id='userConnected'>Bridge Currently Closed. Please wait for it to re-open.</p>, bridgeUserButtonText: "Sign Bridge Message", disableBridgeUserButton: false});
            return;
        }

        if(this.state.accountsLinked){
            this.setState({mainContent: await this.transferCloutComponent(), bridgeUserButtonText: "Sign Bridge Message", disableBridgeUserButton: false});
            return;
        }
        this.setState({mainContent: await this.bridgeUserComponent()});
        
    }

    transferCloutComponent = async () =>{

        const options =[
            {key:"Polygon", text: "Polygon", value:"Polygon"},
            {key:"Bitclout", text: "Bitclout", value:"Bitclout"},
        ]

        var headerMessage, mainSegment, unbridgeSection;

        headerMessage = 
            <p id='bridgeUserText'>             
                <b>{this.props.selectedUser}</b> : <b>{this.props.accounts[0]}</b>
            </p>

        //console.log(bitcloutBalance);
        try{
            var sendButton;
            var requestMintButton = <div></div>
            var feeText;
            var viewMintRequest = await this.props.contractInstance.methods.viewMintRequest().call({from: this.props.accounts[0]});
            if(this.state.dropDownNetwork !== null){
                if(this.state.dropDownNetwork === 'Polygon'){
                    requestMintButton = Number(viewMintRequest) > 0 ? <Button disabled>bClout Mint Requested</Button> 
                                                                    : <Button onClick={this.mintRequest}>Request bClout Mint</Button>;
                    sendButton = (Number(viewMintRequest) < Number(gas.mint * gasPrices[currentFeeLevel]) || this.state.sendDisabled)
                                                         ? <Button disabled>{this.state.sendButtonText}</Button> 
                                                         : <Button onClick={this.handleSend}>{this.state.sendButtonText}</Button>;
                    feeText = <p>Bitclout to Polygon Fee: {this.props.web3.utils.fromWei(this.state.mintFee.toString(), 'ether')} matic + {' '}
                    {Number((Number(this.state.cloutBridgeFee)) / 1000000000).toFixed(9)} $Clout</p>
                }
                if(this.state.dropDownNetwork === 'Bitclout'){
                    sendButton = <Button onClick={this.handleSend}>{this.state.sendButtonText}</Button>
                    feeText = <p>Polygon to Bitclout Fee: {Number((Number(this.state.cloutBridgeFee) + Number(bitcloutTransferFee)) / 1000000000).toFixed(9)} $Clout</p>
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
                            <Header size="tiny"> Transfer:</Header>
                            <p>
                            To:{' '}
                            <Dropdown button inline selection placeholder={options[0]} options={options} onChange= {this.changeNetwork}/>
                            Amount:{' '}
                            <Input size='mini' placeholder="$Clout..." onChange={this.changeInput}/>
                            </p>
                            <Divider></Divider>
                            {feeText}
                            <p>You will recieve: {(Number(this.state.transferAmount) / oneClout).toFixed(9)}</p>
                            {buttonSection}
                            <p>{this.state.transferError}</p>
                            {this.state.transactionText}
                            <p style={{'margin-top': "2vh"}}>Current Fee Level: {currentFeeLevel}</p>
                        </div>
                    </div>

        }catch(err){
            console.log(err)
        }
                                                         
        unbridgeSection = Number(viewMintRequest) > 0 ? 
                            <div id='userUnbridge'>
                                <p> If you would like to remove your mint request select the button bellow. Warning, pending mint fees will not be returned!</p>
                                <Button inverted secondary onClick={this.removeMintRequest}>Remove Mint Request.</Button> 
                            </div>
                            :
                            <div id='userUnbridge'>
                                <p>In the case that you would like to unbridge your accounts select the button below.</p>
                                <Button inverted secondary onClick={this.unbridgeUser}>Unbridge Account.</Button> 
                            </div>

        let content = 
                <div>
                    <p id="bridgeHeader"> Bridge CLOUT</p>
                    <div>
                        {headerMessage}

                        {mainSegment}

                        {unbridgeSection}

                        <p id="disclaimer">*Disclaimer: CloutBridge is a new project and my have unintended risks associated with its of use.</p>
                    </div>
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
        this.setState(() => ({sendButtonText: "Sending..."}));
        try{
            if(this.state.cloutInput === null || isNaN(Number(this.state.cloutInput))){
                this.setState( () => ({transferError: "Invalid $Clout amount.", sendButtonText:"Send"}));
                return;
            }
            if(this.state.dropDownNetwork !== null){
                if(this.state.dropDownNetwork === "Polygon"){
                    await this.transferToEthereum();
                }
                else{
                    await this.transferToBitclout();
                }
            }
            else{
                this.setState(() => ({transferError: "Set Network To Transfer $Clout to."}));
            }

        }catch(error){
            console.log(error);
        }
    }

    transferToEthereum = async () => {
        var clout = parseFloat(this.state.cloutInput) * oneClout;
        //console.log(`Send ${clout} nanos`);
        if(clout > Number(this.state.bitcloutBalance) * oneClout){
            this.setState(() => ({transferError: "Not enough $clout on bitclout network to send.", sendButtonText:"Send"}));
            return;
        }
        if(clout < mintMinimum){
            this.setState(() => ({transferError: "Not enough $Clout entered to meet minimum transfer.", sendButtonText:"Send"}));
            return;
        }
        //console.log("Trasfer to Ethereum")
        try{
            this.setState(()=> ({sendButtonText:"Sending..."}))
            var transactionHex = await axios.get(`${this.props.environment}/api/createTransaction?sender=${this.props.selectedUser}&amount=${clout}`).then((result)=>{
                return result.data.transactionHex;
            })

            this.props.idModule.approve(transactionHex);

            var transactionLink = cloutChainDomin + this.props.selectedUser;

            this.setState(() => ({transferError: `Attemping to send $Clout to Polygon Network. ${'\n'} Wait for transaction to have one confirmation on Bitclout blockchain.(~12 minutes)`, sendButtonText:"Send", sendDisabled: true,
                                  transactionText: <p>User Transactions: <a href={transactionLink} target="_blank" rel="noreferrer">{this.props.selectedUser}</a></p>}));


        }catch(error){  
            console.log("Bitclout transfer Error. \n" + error)
        }

    }

    transferToBitclout = async () =>{
        var clout = parseFloat(this.state.cloutInput) * oneClout;
        //console.log(`Send ${clout} nanos`);
        //console.log("Transfer to Bitclout");
        if(clout > Number(this.state.ethereumCloutBalance) * oneClout){
            this.setState(() => ({transferError: "Not enough $clout on Polygon network to send.", sendButtonText:"Send"}));
            return;
        }
        if(clout - bitcloutTransferFee <= 0){
            this.setState(() => ({transferError: "Not enough $Clout entered to cover transfer fee.", sendButtonText:"Send"}));
            return;
        }
        var minimumBurn = await this.props.contractInstance.methods.minimumBurn.call().call()
        if(clout < minimumBurn){
            this.setState(() => ({transferError: "Not enough $Clout entered to meet minimum transfer.", sendButtonText:"Send"}));
        }
        //var ethBurnFee = await this.props.contractInstance.methods.burnFee.call().call();
        //console.log(`Ether burn fee: ${ethBurnFee}`);
        

        this.setState(() => ({transferError: `Attemping to send $bClout to Bitclout Network. ${'\n'} Wait for transaction to be added to Polygon blockchain for bridge to occur.`}));

        var result = await this.props.contractInstance.methods.burn(clout).send({from: this.props.accounts[0]});

        //console.log(result);

        var transactionLink = ethChainDomain + result.transactionHash;

        //console.log(transactionLink);
        
        this.setState(() => ({transactionText: <p>Transaction: <a href={transactionLink} target="_blank" rel="noreferrer">{result.transactionHash}</a></p>, sendButtonText: "Send"}))
    }

    handleRecieveText = async (cloutValue) =>{

        if(cloutValue !== "" && cloutValue !== null){
            //console.log(cloutValue)
            if(isNaN(Number(cloutValue))){
                this.setState(() => ({transferAmount: "NaN"}));
                return;
            }
            var transferAmount;
            var cloutBridgeFee = Math.floor((cloutValue * oneClout) * .01);
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Polygon"){
                transferAmount = (Math.floor((cloutValue * oneClout) * .99));
            }
            if(this.state.dropDownNetwork !== null && this.state.dropDownNetwork === "Bitclout"){
                transferAmount = (Math.floor((cloutValue * oneClout) * .99) - bitcloutTransferFee);
            }
            this.setState(() => ({transferAmount: transferAmount > 0 ? transferAmount: 0, cloutBridgeFee: cloutBridgeFee}))
        }
    }

    changeNetwork = async (event, {value}) =>{
        this.setState(() => ({dropDownNetwork: value}));
        this.handleRecieveText(this.state.cloutInput);
    }

    changeInput = async (event) => {
        
        this.setState(() => ({cloutInput: event.target.value}));
        this.handleRecieveText(event.target.value);
    }

    unbridgeUser = async () =>{
        try{
            //console.log(`${this.props.accounts[0]}`)

            this.setState(() => ({disableBridgeUserButton: false, bridgeTransactionText : <p></p>}));
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

        if(!this.state.ethAddressBridged && !this.state.bcltAddressBridged){

            //console.log(this.props.signedBridgeMessage)
            
            var signMessage = this.props.signedBridgeMessage === null ? <Button onClick={this.handleBridgeRequest}>Sign Bridge Message</Button>
                                                                      : <Button disabled>Sign Bridge Message</Button>

            var btnSection = this.props.signedBridgeMessage !== null &&  (!this.state.disableBridgeUserButton)
                        ? <Button onClick={this.handleBridgeRequest}>Bridge User Accounts</Button>
                        : <Button disabled>Bridge User Accounts</Button>;
            
            let content = 
            <div>
                <p id="bridgeHeader">Bridge Accounts</p>
                <div id='bridgeUserText'>
                    <Container>
                        <Header size='Medium'>Confirm you want to bridge the following addresses.</Header>
                        <p>Bitclout Address: {this.props.selectedUser}</p>
                        <p>Polygon Address: {this.props.accounts[0]}</p>
                        <div id ='userBridge'>
                            {this.state.bridgeTransactionText}
                            {signMessage}
                            {btnSection}
                            <p>Bridge Fee: {this.props.web3.utils.fromWei(this.state.bridgeFee.toString(), "ether")} Matic</p>
                        </div>
                        <p id="disclaimer">*Disclaimer: CloutBridge is a new project and my have unintended risks associated with its of use.</p>
                    </Container>
                </div>
            </div>
                
            return content;
        }

        if(this.state.ethAddressBridged){

            var mintRequest = await this.props.contractInstance.methods.viewMintRequest().call({from: this.props.accounts[0]});

            var unbridgeButton = mintRequest > 0 ? <div>
                                                    <Button inverted secondary onClick={this.removeMintRequest}>Remove Mint Request.</Button>
                                                    <p>You have a pending mint request of, {web3.utils.fromWei(mintRequest,'ether')} matic. Click above to remove it if you want to unbridge your Account.</p>
                                                   </div>
                                                 : <Button inverted secondary onClick={this.unbridgeUser}>Unbridge Account.</Button>;

            let content = <div id='bridgeUserText'>
                            <p>Your ethereum address, {this.props.accounts[0]} is already bridged.</p>
                            <p> <b>But NOT to:</b> {this.props.selectedUser}</p>
                            <p> Sign-In to the correct Bitclout Account or unbridge your Polygon address.</p>
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
            
            
            var bridgeFee = this.state.bridgeFee;
    
            var bridgeGas = await this.props.contractInstance.methods.bridgeRequest(JSON.stringify(payload)).estimateGas({from: this.props.accounts[0], value: bridgeFee});
        
            console.log(`Bridge Gas : ${bridgeGas}, Bridge Fee: ${bridgeFee}`)
    
            var bridge = await this.props.contractInstance.methods.bridgeRequest(JSON.stringify(payload)).send({from: this.props.accounts[0], value: bridgeFee});

            var transactionLink = ethChainDomain + bridge.transactionHash;

            this.setState(() => ({disableBridgeUserButton : true, bridgeTransactionText: <div><p>Bridging Accounts, Please wait shortly.{'\n'}</p>
                                                       <p>Transaction: <a href={transactionLink} target="_blank" rel="noreferrer">{bridge.transactionHash}</a></p>
                                                  </div>}));

            console.log(bridge);

        }catch(err){
            console.log("error")
            this.setState(() => ({bridgeUserText:<p></p>}))
        }
      }

    signBridgeMessageRequest = async () =>{

        var bridgeMessage = this.props.selectedUser + "<->" + this.props.accounts[0];

        //console.log(bridgeMessage);
    
        var bridgeMessageHash = crypto.createHash("sha256").update(bridgeMessage).digest();
    
        //console.log(bridgeMessageHash.toString('hex'));
    
        var newId = uuidv4();
    
        
        var message = {
          id: newId,
          service: 'identity',
          method: 'burn',
          payload: {
            accessLevel: 4,
            accessLevelHmac: this.props.accessLevelHmac,
            encryptedSeedHex: this.props.encryptedSeedHex,
            unsignedHashes: [bridgeMessageHash]
          },
        }

        /*
        var message2 ={
            id: newId,
            service: 'identity',
            method: 'encrypt',
            payload:{
                accessLevel: 4,
                recipientPublicKey: "BC1YLit7V8XL4xdAQH3HzsXZhSCcPioe3PGw5tB8h6EXqFwrppVAWHS",
                accessLevelHmac: this.props.accessLevelHmac,
                encryptedSeedHex: this.props.encryptedSeedHex,
                message: "encrypt this"
            }
        }*/
    
        this.props.idModule.postMessage(message);
        //this.props.idModule.postMessage(message2);
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

        if(this.props.web3 !== null && this.props.selectedUser !== null){
            let content = <Container textAlign='center'>
                            <div id='transparencyComponent'>
                                <p id='transparencyHeader'>CloutBridge Network Balances</p>
                                <Container>
                                    <Grid columns={4}>
                                        <Grid.Row>
                                            <Grid.Column></Grid.Column>
                                            <Grid.Column><p id='transparencyContent'>Bitclout $CLOUT: {this.state.cloutBridgeBcltBalance}</p> </Grid.Column>
                                            <Grid.Column><p id='transparencyContent'>Polygon $bCLOUT: {this.state.bridgedCloutTotalBalance}</p></Grid.Column>
                                            <Grid.Column></Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Container>
                            </div>
                      </Container>
            return content;
        }
         
        return <div></div>
    }


    render(){

        //this.evaluateUserConnected();

        var transparencyComponent = this.transparencyComponent();

        var mainContent = this.bridgeComponent();

        
        if(this.props.prod){
            //console.log(`Bridge prod`);
            mainContent = this.state.countdownComponent;
            transparencyComponent = <div></div>
        }

        return(
            <Segment style={{overflow:'auto', minHeight: "75vh", maxHeight:"92.25vh", padding: '2em 0em' }}>
                {transparencyComponent}
                <div id='spacer'></div>
                <Container textAlign='center'>
                    <div id='bridgeSegment'>
                        {mainContent}
                    </div>
                </Container>
            </Segment>
        );
    }
}

export default Bridge;