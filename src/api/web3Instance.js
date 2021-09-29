const Web3 = require('web3');
const HDKey = require('hdkey');
const bip39 = require('bip39');

// class to handle a web3 instanace.
module.exports = class web3Instance{

    constructor(_network, _mnemonic, _selectedAccount = 0, _web3 = null){
        if(_web3 === null){
            this.web3Enabled = false;
            this.network = _network

            return (async () => {

                // All async code here
                await this.initializeWeb3Connection();
                await this.initializeKeys(_mnemonic, _selectedAccount);

                return this; // when done
            })();
        }
        else{
            this.web3Enabled = true;
            this.web3 = _web3;
            return (async () => {

                // All async code here
                //await this.initializeKeys(_mnemonic, _selectedAccount);

                this.accounts = await this.web3.eth.getAccounts();
                //console.log(this.accounts);
                this.selectedAccount = this.accounts[_selectedAccount];
                //console.log(this.selectedAccount)

                return this; // when done
            })();
            
        }
    }

    // Initializes the web3 connection.
    initializeWeb3Connection = async () =>{

        const options = {
            // Enable auto reconnection
            reconnect: {
                auto: true,
                delay: 5000, // ms
                maxAttempts: 5,
                onTimeout: false
            }
          };
    
        const provider = new Web3.providers.WebsocketProvider(this.network, options);  //wss://mainnet.infura.io/ws/v3/bf32e2587d834489b5b823d63d08efac
    
        this.hasProviderEnded = false;  
    
        // connect event fires when the connection established successfully. 
        provider.on('connect', () => console.log(" connected to blockchain")); 
            
        // error event fires whenever there is an error response from blockchain and this event also has an error object and message property of error gives us the specific reason for the error 
        provider.on('error', (err) => console.log(err.message)); 
    
        // end event fires whenever the connection end is detected. So Whenever this event fires we will try to reconnect to blockchain 
        provider.on('end', async (err) => {  
            // handle multiple event calls sent by Web3JS library  
            if (this.hasProviderEnded) return;  
       
            // setting hashProviderEnded to true as sometimes the end event is fired multiple times by the provider 
            this.hasProviderEnded = true;  
      
            // reset the current provider  
            provider.reset();  
            // removing all the listeners of provider. 
            provider.removeAllListeners("connect");  
            provider.removeAllListeners("error");  
            provider.removeAllListeners("end");  
       
            setTimeout(() => {  
                     // emitting the restart event after some time to allow blockchain to complete startup 
                     // we are listening to this event in the other file and this callback will initialize a new connection 
                     //endCallback(); 
                     this.initializeWeb3Connection();
            }, 10000);  
        }); 
    
        this.web3 = new Web3(provider);
    }

    // Initializes the web3 account with the mnemomic.
    initializeKeys = async (_mnemonic, _selectedAccount) =>{

        var seed = await bip39.mnemonicToSeed(_mnemonic);
    
        var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));

        this.accounts = []

        var i = 0;
        for(i; i < 10; i++){
            var ethChildKey = hdkey.derive(`m/44'/60'/0'/0/${i}`);
    
            var privateKeyHex = '0x' + ethChildKey._privateKey.toString('hex');
            this.accounts.push(await this.web3.eth.accounts.privateKeyToAccount(privateKeyHex))
            console.log(` Initialized Account ${i}: ${this.accounts[i].address}`);
        }

        this.selectedAccount = this.accounts[_selectedAccount];
        console.log(``);
        console.log(` Selected account ${this.selectedAccount.address}`);
        console.log(``);
    }

    // Returns the web3 instance.
    getWeb3() {
        return this.web3;
    }

    // return an account
    getAccount(_index){
        return this.accounts[_index];
    }

    // return the selected account.
    getSelectedAccount(){
        return this.selectedAccount;
    }

    // set the selected account.
    setSelectedAccount(_index){
        this.selectedAccount = this.accounts.length < _index ? this.accounts[_index] : this.selectedAccount;
    }
    
    // return the current block number.
    getBlock = async () => {
        return await this.web3.eth.getBlockNumber();
    }

    // Deploys a contract.
    deployContract = async (contractFile, args, name, account = this.selectedAccount) =>
    {
        try{
            console.log(`\n   Deploying ${name} Contract.`);
            //console.log(`   From Account: ${account}`);

            const Contract = new this.web3.eth.Contract(contractFile.abi);

            var gas = 0;
            try{
                // Gas estimation
                gas = await new Promise((resolve, reject) => {
                    Contract.deploy({
                        data: contractFile.bytecode,
                        arguments: args
                    })
                    .estimateGas(function(err, gas){
                        if(err){
                            reject(err);
                        }
                        resolve(gas);
                    });
                });
            }catch(err){
                console.log(err);
            }
            
            gas = (gas == 0) ? 15000000 : gas;

            var BN = this.web3.utils.BN;

            gas = new BN(gas);
        
            var gasPrice = new BN(await this.web3.eth.getGasPrice());

            var totalPrice = this.web3.utils.fromWei(gas.mul(gasPrice), 'ether');

            console.log(`   Gas cost: ${gas}, Gas price: ${gasPrice}, Total: ${totalPrice} ether`);

            var block = 0;

            var contract = Contract.deploy({
                data: contractFile.bytecode,
                arguments: args
            })

            var contractInstance = await this.sendEthTransaction(contract, account);

            var contractAddress = contractInstance.contractAddress;

            console.log(`   ${name} Contract Address: ${contractAddress}`);

            return [contractInstance, contractAddress, block];
            
        }
        catch(err){
            console.log(err);
        }
        
        return [0,0,0];
    }

    // Sends a transaction for given the account.
    sendEthTransaction = async (_method, _account = this.selectedAccount, _to = null, _nonce = null, _value= null) =>{

        if(this.web3Enabled){
            
            var tx = {
                from: _account,
                data: _method.encodeABI(),
            }
            if(_to !== null){
                tx.to = _to;
            }
            if(_nonce !== null){
                tx.nonce = _nonce;
            }
            else{
                tx.nonce = await this.web3.eth.getTransactionCount(_account)
                console.log("   Transaction nonce:",tx.nonce);
            }

            if(_value != null){
                tx.value = _value
            }

            tx.gas = await _method.estimateGas({from: _account});

            return await this.web3.eth.sendTransaction(tx);
        }
        try{
            var tx = {
                from: _account.address,
                data: _method.encodeABI(),
                //nonce: _nonce
            }
            if(_to !== null){
                tx.to = _to;
            }

            if(_nonce !== null){
                tx.nonce = _nonce;
            }
            else{
                tx.nonce = await this.web3.eth.getTransactionCount(_account.address)
                console.log("   Transaction nonce:",tx.nonce);
            }

            if(_value != null){
                tx.value = _value
            }
        
            tx.gas = await _method.estimateGas({from: _account.address});
    
            tx.gasPrice = Number(await this.web3.eth.getGasPrice()) + Number(this.web3.utils.toWei("1", "gwei"));
    
            //console.log(tx);
        
            var signedTx = await _account.signTransaction(tx);
        
            //console.log(signedTx)
        
            return await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
        }catch(err){
            console.log("Send Eth Transaction Error", err);
        }
    }
}