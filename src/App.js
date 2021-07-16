import './App.css';

import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';

import {Segment, SegmentGroup} from 'semantic-ui-react'

import {
  Route,
  HashRouter,
} from "react-router-dom";

import Web3 from "web3";

import bitcloutBridgeContract from "./contracts/BridgedBitclout.json";

import TopBar from "./components/TopBar/TopBar.js";

import Main from "./components/Main/Main.js";


import { v4 as uuidv4 } from 'uuid';

const eccrypto = require("eccrypto");

const bs58check = require("bs58check")

var crypto = require("crypto");

const axios = require('axios');

var init = false;
var iframe = null;
var pendingRequests = [];
var identityWindow = null;

var users = null;

var connectionId = null;

var selectedUser = null;
var accessLevelHmac = null;
var encryptedSeedHex = null;

class App extends Component {

  constructor(){
    super();

    var prod = false;

    this.state = {
      web3: null, accounts: null, iframe: null, selectedUser: null, accessLevelHmac: null, encryptedSeedHex: null, bitcloutBridge: null, 
      bridgeUserButtonText: "Sign Bridge Message.", signedBridgeMessage: null,
      network: 0, environment: prod ? "http://3.135.245.95:3001" : "http://localhost:3001",
      toggleSideBar: true};

    this.updateWeb3 = this.updateWeb3.bind(this);
    this.login = this.login.bind(this);
    this.handleBridgeRequest = this.handleBridgeRequest.bind(this);
    this.toggleSideBar = this.toggleSideBar.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.listen();
  }

  login() {
    const windowFeatures = 'location=yes,scrollbars=yes,status=yes, toolbar=no, width=800, height=1000, top=0, left=0';
    identityWindow = window.open('https://identity.bitclout.com/log-in?accessLevelRequest=4', null, windowFeatures);

  }
  
  listen(){
      window.addEventListener('message', message => {
        //console.log('message: ');
        //console.log(message);
    
        const {data: {id: id, method: method, payload: payload}} = message;    
    
        //console.log(`Response Id: ${id} Method: ${method} \nPayload: ${payload}`);
        
        if (method == 'initialize') {
            this.handleInit(message);
        } else if (method == 'login') {
            this.handleLogin(payload);
        }

        if(payload !== undefined && payload.signedHashes !== undefined && payload.signedHashes.length === 1){
          //console.log("signed hash:" + payload.signedHashes);
          this.setState({signedBridgeMessage: payload.signedHashes[0]});
        }
        if(payload !== undefined && payload.signedTransactionHex !== undefined){
          console.log(payload.signedTransactionHex)
          this.sendTransaction(payload.signedTransactionHex);
        }

    });
  }

  handleInit(e){
    if (!init) {
      init = true;
      iframe = document.getElementById("identity");

      for (const e of pendingRequests) {
        this.postMessage(e);
      }
      
      pendingRequests = []
    }
    connectionId = e.data.id;
    this.respond(e.source, e.data.id, {})
  }

  respond(e, t, n) {
    e.postMessage({
        id: t,
        service: "identity",
        payload: n
    }, "*");
  }

  postMessage(e) {
    init ? iframe.contentWindow.postMessage(e, "*") : pendingRequests.push(e)    
  }

  handleLogin(payload) {
    //console.log("users:" + JSON.stringify(payload.users));

    
    selectedUser = payload.publicKeyAdded;
    users = payload.users;
    
    accessLevelHmac = users[selectedUser].accessLevelHmac;

    encryptedSeedHex = users[selectedUser].encryptedSeedHex;

    this.setState({selectedUser: payload.publicKeyAdded, accessLevelHmac: users[selectedUser].accessLevelHmac, encryptedSeedHex: users[selectedUser].encryptedSeedHex})
    //console.log(`Selected user information { user: ${selectedUser}, accessLevelHmac: ${accessLevelHmac}, encryptedSeedHex: ${encryptedSeedHex}}`);

    if (identityWindow) {
        identityWindow.close();
        identityWindow = null;

        /*var element = document.getElementById('loggedin');
        element.innerText = 'Logged in as ' + payload.publicKeyAdded;*/
    }

    //this.makeTransaction()
  }

  sendTransaction = async (signedTransactionHex) =>{
    console.log(`Sending signedTransactionHex: ${signedTransactionHex}`);
    await axios.get(`/api/sendTransaction?signedTransactionHex=${signedTransactionHex}`).then((result)=>{
      console.log(result.data);
    });
  }

  handleBridgeRequest = async () =>{

    console.log("handle bridge request.")
    if(this.state.signedBridgeMessage === null){
        console.log("no signed message")
        await this.signBridgeMessageRequest();
        this.setState({bridgeUserButtonText : "Bridge User"})
        return;
    }

    var bridgeMessage = this.state.selectedUser + "<->" + this.state.accounts[0];

    var payload = {
      message: bridgeMessage,
      userSignature: Buffer.from(this.state.signedBridgeMessage, 'hex')
    }

    //console.log(JSON.stringify(payload));

    //await this.testRequest(JSON.stringify(payload))


    var bridgeFee = await this.state.bitcloutBridge.methods.bridgeFee.call().call()

    var bridgeGas = await this.state.bitcloutBridge.methods.bridgeRequest(JSON.stringify(payload)).estimateGas({from: this.state.accounts[0], value: bridgeFee});
    
    console.log(`Bridge Gas : ${bridgeGas}, Bridge Fee: ${bridgeFee}`)

    await this.state.bitcloutBridge.methods.bridgeRequest(JSON.stringify(payload)).send({from: this.state.accounts[0], value: bridgeFee});

  }

  toggleSideBar = async () =>{

    var visible = !this.state.toggleSideBar;

    console.log("toggle sidebar ", visible);

    this.setState({toggleSideBar: visible})

  }

  signBridgeMessageRequest = async () =>{

    var bridgeMessage = this.state.selectedUser + "<->" + this.state.accounts[0];

    var bridgeMessageHash = crypto.createHash("sha256").update(bridgeMessage).digest();

    console.log(bridgeMessageHash.toString('hex'));

    var newId = uuidv4();

    var message = {
      id: newId,
      service: 'identity',
      method: 'burn',
      payload: {
        accessLevel: 4,
        accessLevelHmac: accessLevelHmac,
        encryptedSeedHex: encryptedSeedHex,
        unsignedHashes: [ bridgeMessageHash ]
      },
    }

    this.postMessage(message);
  }

  updateWeb3 = async () =>{
    if (window.ethereum) {

      try{
        await window.ethereum.enable();
      }
      catch(error){
        console.error(error);
      }
      const web3  = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      
      const network = await web3.eth.getChainId();
      /*
      var networkData = [
        {
          chainId: "0x61"
          chainName: "BSCTESTNET",
          rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
          nativeCurrency: {
            name: "BINANCE COIN",
            symbol: "BNB",
            decimals: 18,
          },
          blockExplorerUrls: ["https://testnet.bscscan.com/"],
        },
      ];
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: networkData,
      });*/

      const bitcloutBridge = new web3.eth.Contract(bitcloutBridgeContract.abi, '0x9f8242Aefb877443F1BC7D81eA350dbcF2F9C403');

      this.setState({web3, accounts, bitcloutBridge, network});

      //console.log("state" + this.state.network)

      window.ethereum.on('accountsChanged', (accounts) => {
        // Handle the new accounts, or lack thereof.
        // "accounts" will always be an array, but it can be empty.
        this.setState({accounts})
      });


      window.ethereum.on('chainChanged', (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        window.location.reload();
      });
      
    }
  }

  render(){

    var ethAccount = this.state.accounts ?  this.state.accounts[0] : "Connect ETH Account";

    var cloutAccount = this.state.selectedUser ? this.state.selectedUser: "Bitclout Sign-In"; 

    var visible = this.state.toggleSideBar;

    //console.log(cloutAccount)
    
    return (
      <div className="App">

        <iframe id="identity" title="id" frameBorder="1" className="" src="https://identity.bitclout.com/embed?v=2" />
        
        <HashRouter>
          <TopBar {...this.state} updateWeb3 = {this.updateWeb3} login = {this.login} cloutAccount = {cloutAccount} ethAccount = {ethAccount} toggleSideBar = {this.toggleSideBar}/>
          <Main {...this.state}  visible = {visible}  handleBridgeRequest = {this.handleBridgeRequest} postMessage = {this.postMessage} />
        </HashRouter>
        
      </div>
    );

  }
}



export default App;
