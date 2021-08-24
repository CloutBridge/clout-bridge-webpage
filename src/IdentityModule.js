const axios = require('axios');

var identityWindow = null;
var app = null;

const windowFeatures = 'location=yes,scrollbars=yes,status=yes, toolbar=no, width=800, height=1000, top=0, left=0';

export default class IdentityModule{

    constructor(app1){

        app = app1;

        this.init = false;
        this.iframe = null;
        this.pendingRequests = [];
        
        this.users = null;

        this.connectionId = null;

        this.selectedUser = null;
        this.accessLevelHmac = null;
        this.encryptedSeedHex = null;

        //app.updateState();

        this.listen()
    }

    login() {
        //console.log("ID Object login")
        identityWindow = window.open('https://identity.bitclout.com/log-in?accessLevelRequest=4', null, windowFeatures);
    }
    
    listen(){
        window.addEventListener('message', message => {
            //console.log('message: ');
            //console.log(message);

            //console.log(`Message origin: ${message.origin}`);
        
            if(message.origin === "https://identity.bitclout.com"){
                const {data: {id: id, method: method, payload: payload}} = message;    

                console.log(message)
        
                //console.log(`Response Id: ${id} Method: ${method} \nPayload: ${payload}`);
                
                if (method === 'initialize') {
                    this.handleInit(message);
                } else if (method === 'login') {
                    //console.log(message);
                    this.handleLogin(payload);
                }

                if(payload !== undefined && payload.encryptedMessage !== undefined){

                    //console.log(message)

                    //var encryptedMessageBuffer = Buffer.from(payload.encryptedMessage, 'hex');
                    console.log(payload.encryptedMessage)

                }
                if(payload !== undefined && payload.signedHashes !== undefined && payload.signedHashes.length === 1){
                    //console.log("signed hash:" + payload.signedHashes);
                    app.updateSignedBridgeMessage(payload.signedHashes[0]);
                    //this.setState({signedBridgeMessage: payload.signedHashes[0]});
                }
                if(payload !== undefined && payload.signedTransactionHex !== undefined){
                    //console.log(payload.signedTransactionHex)
                    this.sendTransaction(payload.signedTransactionHex);
                }
            }
            
        });
    }


    handleInit(e){
        if (!this.init) {
          this.init = true;
          this.iframe = document.getElementById("identity");
    
          for (const e of this.pendingRequests) {
            this.postMessage(e);
          }
          
          this.pendingRequests = []
        }
        this.connectionId = e.data.id;
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
        //console.log(`init ${this.init} e:`, e);
        //console.log(this.iframe);
        this.init ? this.iframe.contentWindow.postMessage(e, "*") : this.pendingRequests.push(e)    
    }

    handleLogin(payload) {
        //console.log("users:" + JSON.stringify(payload.users));
        
        this.selectedUser = payload.publicKeyAdded;
        this.users = payload.users;

        //console.log(this.selectedUser);

        if(this.users[this.selectedUser] !== undefined){
            this.accessLevelHmac = this.users[this.selectedUser].accessLevelHmac;

            this.encryptedSeedHex = this.users[this.selectedUser].encryptedSeedHex;

            app.updateUser(this.selectedUser, this.accessLevelHmac, this.encryptedSeedHex);

            //this.setState({selectedUser: payload.publicKeyAdded, accessLevelHmac: users[selectedUser].accessLevelHmac, encryptedSeedHex: users[selectedUser].encryptedSeedHex})
            //console.log(`Selected user information { user: ${selectedUser}, accessLevelHmac: ${accessLevelHmac}, encryptedSeedHex: ${encryptedSeedHex}}`);
        }
    
        if (identityWindow !== null) {
            identityWindow.close();
            identityWindow = null;
        }
    }

    sendTransaction = async (signedTransactionHex) =>{
        //console.log(`Sending signedTransactionHex: ${signedTransactionHex}`);
        await axios.get(`${app.getEnvironment()}/api/sendTransaction?signedTransactionHex=${signedTransactionHex}`).then((result)=>{
          //console.log(result.data);
        });
      }

    approve = async(transactionHex) =>{
        identityWindow = window.open(`https://identity.bitclout.com/approve?tx=${transactionHex}`, null, windowFeatures);
    }

}
