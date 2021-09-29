import './App.css';

import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';

import {
  HashRouter,
} from "react-router-dom";

import Web3 from "web3";

import bitcloutBridgeContract from "./bin/src/Contracts/BridgedClout.json";

import TopBar from "./components/TopBar/TopBar.js";

import Main from "./components/Main/Main.js";

import IdentityModule from './IdentityModule.js' ;

import axios from 'axios';

var idModule;

class App extends Component {

  constructor(){
    super();

    var prod = true;

    this.state = {
      web3: null, accounts: null, iframe: null, username: "Bitclout Sign-In", selectedUser: null, accessLevelHmac: null, encryptedSeedHex: null, contractInstance: null, contractAddress: "0xE81Dc722D7C7af37aDcF4CC66Ac62543AAeE1Ca2", 
      bridgeUserButtonText: "Sign Bridge Message.", signedBridgeMessage: null,
      network: 0, environment: prod ? "https://ratiomaster.site" : "https://ratiomaster.site", prod: prod,// ratiomaster.site is a proxy for bitclout api calls.
      toggleSideBar: false};

    console.log(`env: ${this.state.environment} prod: ${this.state.prod}`)

    idModule = new IdentityModule(this);

    this.updateWeb3 = this.updateWeb3.bind(this);
    //this.handleBridgeRequest = this.handleBridgeRequest.bind(this);
  }

  toggleSideBar = async () =>{

    var visible = !this.state.toggleSideBar;

    //console.log("toggle sidebar ", visible);

    this.setState({toggleSideBar: visible})

  }

  getEnvironment(){
    return this.state.environment;
  }

  updateUser(user, accessLevelHmac, encryptedSeedHex){

    //console.log("update user")

    axios.get(`${this.state.environment}/api/getUser?sender=${user}`).then((response)=>{
        this.setState({username: response.data.username, selectedUser: user, accessLevelHmac: accessLevelHmac, encryptedSeedHex: encryptedSeedHex})
    })
    //console.log(`${this.state.selectedUser}, ${this.state.accessLevelHmac}, ${this.state.encryptedSeedHex}`);
  }

  updateSignedBridgeMessage(message){
    this.setState({signedBridgeMessage:message});
    //console.log(this.state.signedBridgeMessage)
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
      
      var networkData = [
        {
          chainId: "0x89",
          chainName: "Polygon",
          rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
          nativeCurrency: {
            name: "Matic",
            symbol: "MATIC",
            decimals: 18,
          },
          blockExplorerUrls: ["https://explorer-mainnet.maticvigil.com/"],
        },
      ];
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: networkData,
      });
      
      var contractAddress = '0xe306AeD16B434418e0cCC75F31FBF46B6bB1bEF2';

      const contractInstance = new web3.eth.Contract(bitcloutBridgeContract.abi, contractAddress);

      this.setState({web3, accounts, contractInstance, network, contractAddress: contractAddress});

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

    var visible = this.state.toggleSideBar;

    //console.log(cloutAccount)
    
    return (
      <div className="App">

        <iframe id="identity" title="id" frameBorder="1" className="" src="https://identity.bitclout.com/embed?v=2" />
        
        <HashRouter>
          <TopBar {...this.state} updateWeb3 = {this.updateWeb3} idModule = {idModule} ethAccount = {ethAccount} toggleSideBar = {this.toggleSideBar}/>
          <Main {...this.state}  visible = {visible} idModule={idModule} handleBridgeRequest = {this.handleBridgeRequest} postMessage = {this.postMessage} />
        </HashRouter>
        
      </div>
    );
  }
}



export default App;
