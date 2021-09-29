// Contract File
const deSoDAO = require('../bin/src/Contracts/DeSoDAO.json');

// Class to handle requests to the cloutDAOToken contract.
module.exports = class DeSoDAO{

    constructor(_web3Instance, _contractAddress = null){
        this.web3I = _web3Instance;
        this.web3 = this.web3I.getWeb3();
        this.BN = this.web3.utils.BN;
        if(_contractAddress !== null)
            this.initialize(_contractAddress)
    }

    // deploy and initialize the contract
    deploy = async (_addresses, _amounts) =>{
        //console.log(this.account)
        var deploymentResult = await this.web3I.deployContract(deSoDAO, [this.web3I.getSelectedAccount().address, _addresses, _amounts], `DeSoDAO`); //address _operator, uint airdropMint, address[] memory _addresses, uint[] memory _amounts
        this.initialize(deploymentResult[1]);
    }

    // initialize the contract
    initialize(_contractAddress){
        this.contract = new this.web3.eth.Contract(deSoDAO.abi, _contractAddress);
        this.contractAddress = _contractAddress;
    }

    // return the token contract address
    getContractAddress(){
        return this.contractAddress;
    }

    // return the operator of the deSoDAO contract.
    getOperator = async () =>{
        return await this.contract.methods.operator.call().call();
    }

    // return the chef of the deSoDAO contract.
    getChef = async () =>{
        return await this.contract.methods.chef.call().call();
    }

    setChef = async(_chef) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.setChef(_chef), this.web3I.getSelectedAccount(), this.contractAddress);
    }

    balanceOf = async(_address) =>{
        return await this.contract.methods.balanceOf(_address).call();
    }

    mint = async (_to, _amount) =>{
        return await this.web3I.sendEthTransaction(this.contract.methods.mint(_to, _amount), this.web3I.getSelectedAccount(), this.contractAddress);
    }

}