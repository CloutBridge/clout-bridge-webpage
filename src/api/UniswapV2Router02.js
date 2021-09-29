const uniswapV2Router02 = require('../../bin/src/Contracts/uniswapv2/UniswapV2Router02.json');

module.exports = class UniswapV2Router02 {
    constructor(_web3Instance, _contractAddress = null){
        this.web3I = _web3Instance;
        this.web3 = this.web3I.getWeb3();
        if(_contractAddress !== null)
            this.initialize(_contractAddress)
    }

    // deploy and initialize the contract
    deploy = async (_factory, _WETH) =>{
        //console.log(this.account)
        var deploymentResult = await this.web3I.deployContract(uniswapV2Router02, [_factory, _WETH], `uniswapV2Router02`);
        this.initialize(deploymentResult[1]);
    }

    // initialize the contract
    initialize(_contractAddress){
        this.contract = new this.web3.eth.Contract(uniswapV2Router02.abi, _contractAddress);
        this.contractAddress = _contractAddress;
    }

    addLiquidity = async(_tokenA, _tokenB, _amountADesired, _amountBDesired, _amountAMin, _amountBMin, _to, _deadline) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.addLiquidity(_tokenA, _tokenB, _amountADesired, _amountBDesired, _amountAMin, _amountBMin, _to, _deadline)
                                                 , this.web3I.getSelectedAccount(), this.contractAddress)
    }
}