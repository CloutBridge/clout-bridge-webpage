const masterChef = require('../bin/src/Contracts/MasterChef.json');
const web3Instance = require('./web3Instance');

module.exports = class MasterChef{

    constructor(_web3Instance, _contractAddress = null){
        this.web3I = _web3Instance;
        this.web3 = this.web3I.getWeb3();
        if(_contractAddress !== null)
            this.initialize(_contractAddress)
    }

    // deploy and initialize the contract
    deploy = async (_tokenAddress, _devaddr, _cloutPerBlock, _startBlock, _bonusEndBlock) =>{
        //console.log(this.account)
        var deploymentResult = await this.web3I.deployContract(masterChef, [_tokenAddress, _devaddr, _cloutPerBlock, _startBlock, _bonusEndBlock], `MasterChef`);
        this.initialize(deploymentResult[1]);
    }

    // initialize the contract
    initialize(_contractAddress){
        this.contract = new this.web3.eth.Contract(masterChef.abi, _contractAddress);
        this.contractAddress = _contractAddress;
    }

    // set the account to perform transactions
    setAccount(_index){
        this.account = this.web3I.getAccount(_index);
    }

    // return the token contract address
    getContractAddress(){
        return this.contractAddress;
    }

    // get a pool
    poolInfo = async(_index) =>{
        return await this.contract.methods.poolInfo(_index).call()
    }

    // get the number of pools
    poolLength = async() =>{
        return await this.contract.methods.poolLength().call();
    }

    userInfo = async(_pid, _address) =>{
        return await this.contract.methods.userInfo(_pid, _address).call();
    }

    totalAllocPoint = async () =>{
        return await this.contract.methods.totalAllocPoint.call().call();
    }

    // add a pool
    add = async (_allocPoint, _lpToken, _withUpdate) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.add(_allocPoint, _lpToken, _withUpdate), this.web3I.getSelectedAccount(), this.contractAddress)
    }

    // deposit amount to the lp pool of pid.
    deposit = async (_pid, _amount) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.deposit(_pid, _amount), this.web3I.getSelectedAccount(), this.contractAddress);
    }

    // withdraw _amount from the lp pool of _pid.
    withdraw = async( _pid, _amount) => {
        return await this.web3I.sendEthTransaction(this.contract.methods.withdraw(_pid,_amount), this.web3I.getSelectedAccount(), this.contractAddress);
    }

    // harvest cDAO from lp pool of _pid.
    harvest = async (_pid) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.harvest(_pid), this.web3I.getSelectedAccount(), this.contractAddress);
    }

    // return pending clout in pool _pid for _user.
    pendingClout = async (_pid, _user) => {
        return await this.contract.methods.pendingClout(_pid, _user).call();
    } 

    // update the pool _pid
    updatePool = async (_pid) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.updatePool(_pid), this.web3I.getSelectedAccount(), this.contractAddress);
    }


}