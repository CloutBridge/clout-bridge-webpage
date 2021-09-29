var LPToken = require('../bin/src/Contracts/Token.json');

// Class to handle requests to the lpToken contract.
module.exports = class Token{
    constructor(_web3Instance, _contractAddress = null, _type = null){
        this.web3I = _web3Instance;
        this.web3 = this.web3I.getWeb3();

        if(_type !== null)
            LPToken = require('../bin/src/Contracts/uniswapv2/UniswapV2Pair.json')

        if(_contractAddress !== null)
            this.initialize(_contractAddress)
    }

    // deploy and initialize the contract
    deploy = async (_name, _symbol) =>{
        //console.log(this.account)
        var deploymentResult = await this.web3I.deployContract(LPToken, [this.web3I.getSelectedAccount().address, _name, _symbol], _name);
        this.initialize(deploymentResult[1]);
    }

    // initialize the contract
    initialize(_contractAddress){
        this.contract = new this.web3.eth.Contract(LPToken.abi, _contractAddress);
        this.contractAddress = _contractAddress;
    }

    // return the token contract address
    getContractAddress(){
        return this.contractAddress;
    }

    // return the total supply 
    totalSupply = async () =>{
        return await this.contract.methods.totalSupply().call();
    }

    // return the balance of the address
    balanceOf = async (_address) =>{
        return await this.contract.methods.balanceOf(_address).call();
    }

    transfer = async (_recipient, _amount) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.transfer(_recipient,_amount), this.web3I.getSelectedAccount(), this.contractAddress);
    }
    
    // approve spending by _recipent of _amount 
    approve = async (_recipient, _amount) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.approve(_recipient, _amount), this.web3I.getSelectedAccount(), this.contractAddress);
    }

    // return the allowance for the _owner by _spender
    allowance = async (_owner, _spender) =>{
        return await this.contract.methods.allowance(_owner, _spender).call();
    }

    // return reserves of token0 and token1
    getReserves = async () =>{
        return await this.contract.methods.getReserves().call();
    }

    // return address of token0
    token0 = async () =>{
        return await this.contract.methods.token0.call().call();
    }

    // return address of token1
    token1 = async () =>{
        return await this.contract.methods.token1.call().call();
    }
}