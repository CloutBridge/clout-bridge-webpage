import './App.css';

import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';

import {
  Route,
  HashRouter,
} from "react-router-dom";

import Web3 from "web3";

import bitcloutBridgeContract from "./contracts/BridgedBitclout.json";

import TopBar from "./components/TopBar/TopBar.js";

import Bridge from "./components/Bridge/Bridge.js"

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

  state = {web3: null, accounts: null, iframe: null, selectedUser: null, accessLevelHmac: null, encryptedSeedHex: null, bitcloutBridge: null, 
           bridgeUserButtonText: "Sign Bridge Message.", signedBridgeMessage: null,
           network: 0};

  constructor(){
    super();
    this.updateWeb3 = this.updateWeb3.bind(this);
    this.login = this.login.bind(this);
    this.handleBridgeRequest = this.handleBridgeRequest.bind(this);
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

  makeTransactionTest = async () =>{

    console.log(` Selected user: ${selectedUser}`);

      try{
        var res = await axios.get(`/api/createTransaction?sender=${'BC1YLiH2S2AYcYKt9eNpzv2x4pj8Ndw1konMG7ZkEN11Wd6bBryasx6'}`).then(async (response) =>{
          return response.data;
        })
    
        console.log(res.transactionHex)
        console.log(res.transactionHex.length);

        //const aprove =  window.open(`https://identity.bitclout.com/approve?tx=${res.transactionHex}`, null, 'toolbar=no, width=800, height=1000, top=0, left=0')

        // 066aa66e5d38618bfa2d26101a40b6e67cd8c2529db8242834cf913da41746ca6c0081a15ba7f045d949b2b5dcf289efef140993822f39985b131fef68cdb2f3052b00369ce2b086fa0a353e16e568a85d35e37c61c30dd381625e7131f527265d4d8e004ae98b4596458921392876f58eec0680c4d0aa211ceb7e7cf6d6bd04b594aad900fa5ba839807b21178cb4f34597676ed01a64206c6cbc569d8b1dd850f88a514400f0753d896a7150c269fb171d3b1920aaaad1edf28634496ae8fd15546c1d7238010203a6e266bf0c1f175fbe45fe3b11d6937fd3b93a1ec1e79a1dcf84f7eeb33da56701035736fa4674860c51c92489430425467c8e5e23fa23395dd111366479fc5a63e0e8f305020021035736fa4674860c51c92489430425467c8e5e23fa23395dd111366479fc5a63e00000
        
        var newId = uuidv4();

        //console.log(`new id ${newId}`)

        var data = "BC1YLit7V8XL4xdAQH3HzsXZhSCcPioe3PGw5tB8h6EXqFwrppVAWHS<->0x4d01C4f0E661347079B7eC9D82EDCfcbFae34c5e";
        var hexString = Buffer.from(data).toString('hex');

        //console.log(hexString);

        var message = {
          id: newId,
          service: 'identity',
          method: 'burn',
          payload: {
            accessLevel: 4,
            accessLevelHmac: accessLevelHmac,
            encryptedSeedHex: encryptedSeedHex,
            unsignedHashes: [ res.transactionHex ]
          },
        }
        console.log(message);
        this.postMessage(message);

      }catch(error){
        console.log(error)
      }
    
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

  /*/
  testRequest = async (payload) =>{

    var bridgeMessageJSON = JSON.parse(payload);

    var message = bridgeMessageJSON.message;

    var messageHash = crypto.createHash("sha256").update(message).digest();

    var messageArray = message.split("<->");

    if(messageArray.length !== 2){
      console.log("Incorrect message format.")
      return [false];
    }

    var bcltUserPublicKey = messageArray[0];
        
    var userPublicKeyBuffer = Buffer.from(bs58check.decode(bcltUserPublicKey).toString('hex').substring(6), 'hex');

    var signature = Buffer.from(bridgeMessageJSON.userSignature.data)

    await eccrypto.verify(userPublicKeyBuffer, messageHash, signature).then(function(){
      console.log("Signature verified")
    }).catch(function(){
      console.log("Signature NOT verified!")
    })

  }*/

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

          chainId: "0x61",

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

    //console.log(cloutAccount)
    
    return (
      <div className="App">

        <iframe id="identity" title="id" frameBorder="1" className="" src="https://identity.bitclout.com/embed?v=2" />

        <HashRouter>
          <TopBar {...this.state} updateWeb3 = {this.updateWeb3} login = {this.login} cloutAccount = {cloutAccount} ethAccount = {ethAccount}/>
          <Route exact path='/' render = {(routeProps) => (<Bridge handleBridgeRequest = {this.handleBridgeRequest} postMessage = {this.postMessage} {...routeProps} {...this.state}/>)}/>
        </HashRouter>
        
      {/* 
        <button onClick={this.login} id="login" type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Login with BitClout
        </button>        

        <button onClick={this.makeTransaction} title="view">EncryptMessage</button>

      <div class="mt-6" id="loggedin"></div>*/}
      </div>
    );

  }
}



export default App;
