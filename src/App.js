import './App.css';

import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';

import {
  HashRouter,
} from "react-router-dom";

import Web3 from "web3";

import bitcloutBridgeContract from "./contracts/BridgedBitclout.json";

import TopBar from "./components/TopBar/TopBar.js";

import Main from "./components/Main/Main.js";

import IdentityModule from './IdentityModule.js' ;

import { createMedia } from '@artsy/fresnel';

const { MediaContextProvider, Media } = createMedia({
  breakpoints: {
    mobile: 0,
    tablet: 768,
    computer: 1024,
  },
})

//var init = false;
//var iframe = null;
//var pendingRequests = [];
//var identityWindow = null;

//var users = null;

//var connectionId = null;

//var selectedUser = null;
//var accessLevelHmac = null;
//var encryptedSeedHex = null;

var idModule;

class App extends Component {

  constructor(){
    super();

    var prod = false;

    this.state = {
      web3: null, accounts: null, iframe: null, selectedUser: null, accessLevelHmac: null, encryptedSeedHex: null, bitcloutBridge: null, 
      bridgeUserButtonText: "Sign Bridge Message.", signedBridgeMessage: null,
      network: 0, environment: prod ? "https://ratiomaster.site" : "http://localhost:3001", prod: prod,
      toggleSideBar: false};

    console.log(`env: ${this.state.environment} prod: ${this.state.prod}`)

    idModule = new IdentityModule(this);

    this.updateWeb3 = this.updateWeb3.bind(this);
    //this.handleBridgeRequest = this.handleBridgeRequest.bind(this);
  }

  toggleSideBar = async () =>{

    var visible = !this.state.toggleSideBar;

    console.log("toggle sidebar ", visible);

    this.setState({toggleSideBar: visible})

  }

  getEnvironment(){
    return this.state.environment;
  }

  updateUser(user, accessLevelHmac, encryptedSeedHex){
    this.setState({selectedUser: user, accessLevelHmac: accessLevelHmac, encryptedSeedHex: encryptedSeedHex})
    //console.log(`${this.state.selectedUser}, ${this.state.accessLevelHmac}, ${this.state.encryptedSeedHex}`);
  }

  updateSignedBridgeMessage(message){
    this.setState({signedBridgeMessage:message});
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

      const bitcloutBridge = new web3.eth.Contract(bitcloutBridgeContract.abi, '0x0A357D1f102D96BB4c66e708CE598D8529EA6a05');

      this.setState({web3, accounts, bitcloutBridge, network});

      //console.log("state" + this.state.network)

      window.ethereum.on('accountsChanged', (accounts) => {
        // Handle the new accounts, or lack thereof.
        // "accounts" will always be an array, but it can be empty.
        this.updateWeb3();
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

    var ethAccount = this.state.accounts ?  this.state.accounts[0] : "Connect Metamask";

    var cloutAccount = this.state.selectedUser ? this.state.selectedUser : "Bitclout Sign-In"; 

    var visible = this.state.toggleSideBar;

    //console.log(cloutAccount)
    
    return (
      <div className="App">

        <iframe id="identity" title="id" frameBorder="1" className="" src="https://identity.bitclout.com/embed?v=2" />
        
        <HashRouter>
          <TopBar {...this.state} updateWeb3 = {this.updateWeb3} idModule = {idModule} cloutAccount = {cloutAccount} ethAccount = {ethAccount} toggleSideBar = {this.toggleSideBar}/>
          <Main {...this.state}  visible = {visible} idModule={idModule} handleBridgeRequest = {this.handleBridgeRequest} postMessage = {this.postMessage} />
        </HashRouter>
        
      </div>
    );

  }
}



export default App;
