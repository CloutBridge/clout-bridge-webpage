const uniswapV2Factory = require('../../bin/src/Contracts/uniswapv2/UniswapV2Factory.json');


module.exports = class UniswapV2Factory {

    constructor(_web3Instance, _contractAddress = null){
        this.web3I = _web3Instance;
        this.web3 = this.web3I.getWeb3();
        if(_contractAddress !== null)
            this.initialize(_contractAddress)
    }

    // deploy and initialize the contract
    deploy = async (_feeToSetter) =>{
        //console.log(this.account)
        var deploymentResult = await this.web3I.deployContract(uniswapV2Factory, [_feeToSetter], `UniswapV2Factory`);
        this.initialize(deploymentResult[1]);
    }

    // initialize the contract
    initialize(_contractAddress){
        this.contract = new this.web3.eth.Contract(uniswapV2Factory.abi, _contractAddress);
        this.contractAddress = _contractAddress;
    }

    // return the token contract address
    getContractAddress(){
        return this.contractAddress;
    }

    // returns the amount of pairs in the factory.
    allPairsLength = async () =>{
        return await this.contract.methods.allPairsLength().call();
    }

    // creates a token pair from _tokenA and _tokenB
    createPair = async (_tokenA, _tokenB) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.createPair(_tokenA, _tokenB), this.web3I.getSelectedAccount(), this.contractAddress)
    } 

    // returns PairCreated events from the _block to current
    PairCreated = async (_fromBlock, _toBlock) =>{
        return await this.contract.getPastEvents(`PairCreated`,{fromBlock:_fromBlock, toBlock: _toBlock})
    }
}