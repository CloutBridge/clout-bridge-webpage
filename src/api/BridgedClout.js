const bClout = require('../../bin/src/Contracts/BridgedClout.json');

// Class to handle requests to the lpToken contract.
module.exports = class BridgedClout{
    constructor(_web3Instance, _contractAddress = null){
        this.web3I = _web3Instance;
        this.web3 = this.web3I.getWeb3();
        if(_contractAddress !== null)
            this.initialize(_contractAddress)
    }

    // deploy and initialize the contract
    deploy = async () =>{
        //console.log(this.account)
        var deploymentResult = await this.web3I.deployContract(bClout, [this.web3I.getSelectedAccount().address], `obClout`);
        this.initialize(deploymentResult[1]);
    }

    // initialize the contract
    initialize(_contractAddress){
        this.contract = new this.web3.eth.Contract(bClout.abi, _contractAddress);
        this.contractAddress = _contractAddress;
    }

    // return the token contract address
    getContractAddress(){
        return this.contractAddress;
    }

    // return the balance of the address
    balanceOf = async (_address) =>{
        return await this.contract.methods.balanceOf(_address).call();
    }
    
    // approve spending by _recipent of _amount 
    approve = async (_recipient, _amount) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.approve(_recipient, _amount), this.web3I.getSelectedAccount(), this.contractAddress);
    }

    // return the allowance for the _owner by _spender
    allowance = async (_owner, _spender) =>{
        return await this.contract.methods.allowance(_owner, _spender).call();
    }

    // determines if the _bcltAddress is bridged.
    userBridged = async (_bcltAddress = null) =>{
        if(_bcltAddress !== null){
            return await this.contract.methods.userBridged(_bcltAddress).call();
        }
        await this.contract.methods.userBridged().call({from: this.web3I.getSelectedAccount().address});
    }

    // returns a eth address for the given _bcltKey
    bcltToEthAddress = async (_bcltKey) =>{
        return await this.contract.methods.bcltToEthAddress(_bcltKey).call();
    }
}