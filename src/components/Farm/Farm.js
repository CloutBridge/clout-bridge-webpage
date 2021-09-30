import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import {Segment, Container, Header, Button, Input, Divider, Card, Image} from 'semantic-ui-react';

import web3Instance from '../../api/web3Instance.js';
import masterChef from '../../api/MasterChef.js';
import Token from '../../api/Token.js'

import "./Farm.css";

import DesoLogo from "../../logos/oldLogo/BitcloutLogo.png";
import cDAOLogo from "../../icons/diamond/diamond.jpg"

class Farm extends Component{

    state = {
        connectedContent: <p>loading...</p>, header: <p></p>, cards: <p></p>, cardsSegment: <p></p>, stakeBar: [], amount: []
    }
    constructor(props){
        super();
        this.props = props;
        this.DeSoDAOAddress = "0x02Fc0C702532151B25e1C74F413f27D28EfD9dC9";
        this.masterChefAddress = "0xbAC6308Bf322A781340e29EBA8C47743C3D93f53";
        this.USDCAddress = "0x1275A5c76dC099035884d44c27f5538151FeBA10";

        this.lpTokenInfo = {
            "0xC1ad03Aa2BF81dFc816867fc3efd19f044d3e2A6" : {name: "DeSoDAO-USDC", logo: cDAOLogo},
            "0x33021D2693D5fC0F89386293CF92A6Db05900427" : {name: "wDeSo-USDC", logo : DesoLogo},
            
        }
    }

    componentDidMount() {
        this.evaluateUserConnected()
        this.interval = setInterval( async() =>{
            await this.evaluateUserConnected();    
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    evaluateUserConnected = async () =>{
        if(this.props.web3 !== null){

            //console.log("Web3 connected...");
            //console.log(` Eth account: ${this.props.accounts[0]}`)

            if(this.props.network !== 5 && this.props.network !== 137){
                this.setState({connectedContent: <p id="userConnected">Switch Network to Polygon</p>})
                return;
            }

            //console.log("Connected");

            this.setState(() => ({connectedContent: <p></p>, header: <Header size='huge'>DeSo Farm</Header>}));

            await this.evaluateEthereumState();

            return;
        }
        //console.log("Web3 not connected");

        this.setState(() => ({connectedContent: <p id="userConnected"> Connect MetaMask Account.</p>}));
        return;
    }

    evaluateEthereumState = async () =>{
        
        if(this.props.web3 !== undefined && this.web3I === undefined){
            console.log(` web3I undefined`);
            this.web3I =  await new web3Instance("","", 0, this.props.web3);
            console.log(this.web3I.getSelectedAccount())
            this.utils = this.props.web3.utils;
            this.BN = this.utils.BN;
        }

        if(this.pools === undefined && this.web3I !== undefined){
            console.log(`Initialize pools`);
            this.pools = [];
            this.masterChef = new masterChef(this.web3I, this.masterChefAddress);
            var stakeBar = [];
            var amount = [];

            var poolLen = await this.masterChef.poolLength();

            console.log(poolLen)

            this.totalAllocPoint = await this.masterChef.totalAllocPoint();
            
            var i = 0;
            for(i; i < poolLen; i++){
                var info = await this.masterChef.poolInfo(i)

                //console.log(` contract:  ${info.lpToken}`);

                this.lpTokenInfo[info.lpToken].info = info;

                this.lpTokenInfo[info.lpToken].pid = i; 

                this.lpTokenInfo[info.lpToken].contract = new Token(this.web3I, info.lpToken, 1);

                var balance = await this.lpTokenInfo[info.lpToken].contract.balanceOf(this.web3I.getSelectedAccount());

                this.lpTokenInfo[info.lpToken].balance = Number(this.utils.fromWei(balance.toString(), `ether`)).toFixed(5)

                //console.log(` token balance: ${this.lpTokenInfo[info.lpToken].balance}`)

                var userInfo = await this.masterChef.userInfo(i, this.web3I.getSelectedAccount());

                this.lpTokenInfo[info.lpToken].staked= Number(this.utils.fromWei(userInfo.amount.toString(), 'ether')).toFixed(5);

                var earned = await this.masterChef.pendingClout(i, this.web3I.getSelectedAccount())

                //console.log(earned);

                this.lpTokenInfo[info.lpToken].earned = Number(this.utils.fromWei(earned.toString(), `ether`)).toFixed(5);

                this.lpTokenInfo[info.lpToken].APR = await this.calcAPR(info.lpToken);

                this.lpTokenInfo[info.lpToken].multiplier = this.lpTokenInfo[info.lpToken].info.allocPoint / 100;

                //console.log(`${this.lpTokens[info.lpToken]}`)
                this.pools.push(info);
                
                stakeBar.push(<div id = 'cardDesc'>
                                 <div></div><div id ='endCard'></div>
                              </div>);

                amount.push(0);
            }

            this.setState(() => ({stakeBar}))

            this.cards();
        }
    }

    cards(){
        var cards = this.pools.map(token =>(
            <Card raised>
                <Card.Content>
                    <Image src={this.lpTokenInfo[token.lpToken].logo} size='mini' floated='right'/>
                    <Card.Header textAlign ='left'>{this.lpTokenInfo[token.lpToken].name} : {this.lpTokenInfo[token.lpToken].multiplier}x</Card.Header>
                    <Divider/>
                    <div id = 'cardDesc'>
                        <div>APR:</div><div id ='endCard'>{this.lpTokenInfo[token.lpToken].APR}%</div>
                    </div>
                    <div id = 'cardDesc'>
                        <div>LP-Staked:</div><div id ='endCard'>{this.lpTokenInfo[token.lpToken].staked}</div>
                    </div>
                    <div id = 'cardDesc'>
                        <div>Earned:</div><div id ='endCard'>{this.lpTokenInfo[token.lpToken].earned}</div>
                    </div>
                    <div style={{height: '1vh'}}></div>
                    <div id = 'cardDesc'>
                        <div>LP-Balance:</div><div id ='endCard'>{this.lpTokenInfo[token.lpToken].balance}</div>
                    </div>
                </Card.Content>
                
                <Card.Content extra>
                    <div id='cardDesc'>
                        <Button basic color='black' onClick={() => this.handleHarvest(token.lpToken, this.lpTokenInfo[token.lpToken].pid)}>Harvest</Button>
                        <div id="endCard">
                            <Button basic color='black' onClick={() => this.handleStakeChange(token.lpToken, this.lpTokenInfo[token.lpToken].pid, '+')} >+</Button>
                            <Button basic color='black' onClick={() => this.handleStakeChange(token.lpToken, this.lpTokenInfo[token.lpToken].pid, '-')}>-</Button>
                        </div>
                    </div>
                    {this.state.stakeBar[this.lpTokenInfo[token.lpToken].pid]}
                </Card.Content>
            </Card>
        ))
        this.setState(()=>({cards}))
    }

    calcAPR = async (_token) =>{

        //console.log(`totalAllocPoint ${totalAllocPoint}`);

        var deSoDAOUSDC = await this.lpTokenInfo["0xC1ad03Aa2BF81dFc816867fc3efd19f044d3e2A6"].contract.getReserves();

        console.log(`reserve0: ${this.utils.fromWei(deSoDAOUSDC._reserve0,`ether`)} reserve1 ${this.utils.fromWei(deSoDAOUSDC._reserve1,`ether`)}`)

        var daoPrice = deSoDAOUSDC._reserve1 / deSoDAOUSDC._reserve0;

        console.log(`DAOPrice ${daoPrice}`)

        //console.log(`allocPoint ${this.lpTokenInfo[_token].info.allocPoint}`);

        var totalAllocPercent = this.lpTokenInfo[_token].info.allocPoint / this.totalAllocPoint;

        //console.log(`totalAllocPercent: ${totalAllocPercent}`)

        var totalYearDist = 31_536_000 * totalAllocPercent;

        //console.log(`totalYearDist: ${totalYearDist}`)

        var totalDistributionValue = totalYearDist * daoPrice;

        var pooledTotalValue = await this.getPooledTotalValue(_token);

        var apr = Number((totalDistributionValue / pooledTotalValue) * 100).toFixed(2); 

        console.log(` Dao Price: ${daoPrice}, total  totalDistvalue: ${totalDistributionValue}, pooled total val: ${pooledTotalValue}`)

        console.log(` APR: ${apr} APR as fraction: ${totalDistributionValue / pooledTotalValue}`)

        return apr;
    }

    getPooledTotalValue = async (_token) =>{
        var token0 = await this.lpTokenInfo[_token].contract.token0();

        var token1 = await this.lpTokenInfo[_token].contract.token1();

        if(token0 === this.USDCAddress || token1 === this.USDCAddress){
            console.log(`direct valuation`);

            var totalValue;

            var totalTokens = await this.lpTokenInfo[_token].contract.totalSupply()

            var masterChefLiquidity = await this.lpTokenInfo[_token].contract.balanceOf(this.masterChef.contractAddress);
            
            var masterChefPercent = masterChefLiquidity / totalTokens;

            console.log(` total tokens: ${totalTokens} , master chef liquidity: ${masterChefLiquidity}, master chef percent: ${masterChefPercent}`)

            var totalUSDValuation;
            var tokenReserves = await this.lpTokenInfo[_token].contract.getReserves()
            if(token0 === this.USDCAddress){
                var reserve0 = this.utils.fromWei(tokenReserves._reserve0.toString(), `ether`)
                totalUSDValuation =  2 * reserve0;
            }
            else{
                var reserve1 = this.utils.fromWei(tokenReserves._reserve0.toString(), `ether`)
                totalUSDValuation = 2 * reserve1;
            }

            totalValue = totalUSDValuation * masterChefPercent

            console.log(`Total masterchef lp token pid ${this.lpTokenInfo[_token].pid} value ${totalValue}`);

            return totalValue;
        }
    }

    handleHarvest = async (_token, _pid) =>{
        await this.masterChef.harvest(_pid);

        await this.updatePoolInfo(_token, _pid);
    }

    handleStakeChange(_token, _pid, _symbol){

        console.log(` pid: ${_pid} symbol: ${_symbol}`);

        var name = _symbol === '+' ? "Deposit" : "Withdraw"

        var amount = this.state.amount;
        amount[_pid] = 0;
        var stakeBar = this.state.stakeBar;
        stakeBar[_pid] = 
                    <div id = 'cardDesc' style={{'padding-top': '1vh'}}>
                        <div><Input placeholder ='Amount...' size='mini' style={{width: '7vw'}} onChange={this.amountChange} pid={_pid}></Input></div>
                        <div id ='endCard'>
                            
                            <Button basic color='black' onClick={this.handleStake} token={_token} name={name} pid={_pid}>{name}</Button>
                        </div>
                    </div>
        this.setState(()=>({stakeBar, amount}))
        this.cards();
        return;

    } 

    amountChange = (e, data) =>{
        
        if(!(Number(e.target.value).toString() === Number.NaN.toString())){
            
            var amount = this.state.amount

            amount[data.pid] = e.target.value;

            this.setState(()=>({amount}))
            return;
        }
        console.log(`NaN ${data.pid}: ${e.target.value} `)
    }

    handleStake = async (e, data) =>{
        var amount = this.state.amount;
        
        if(amount[data.pid] > 0){

            console.log(` amount ${amount[data.pid]} balance: ${this.lpTokenInfo[data.token].balance}`)
            if(data.name === "Deposit"){

                if(!(Number(amount[data.pid]) <= Number(this.lpTokenInfo[data.token].balance))){
                   
                    return
                }
                var deposit = this.utils.toWei(amount[data.pid].toString(), `ether`)
                console.log(`Deposit ${deposit}`);
                
                var allowance = await this.lpTokenInfo[data.token].contract.allowance(this.web3I.getSelectedAccount(), this.masterChef.getContractAddress());

                console.log(`allowance: ${allowance}`)

                if(!(allowance >= deposit)){
                    await this.lpTokenInfo[data.token].contract.approve(this.masterChef.getContractAddress(), deposit)
                }

                await this.masterChef.deposit(data.pid, deposit)
            }
            else{
                if(!(Number(amount[data.pid]) <= Number(this.lpTokenInfo[data.token].staked))){
                    return
                }
                var withdraw = this.utils.toWei(amount[data.pid].toString(), `ether`)
                console.log(`Withdraw ${amount[data.pid]}`)
                await this.masterChef.withdraw(data.pid, withdraw)
            }   
            await this.updatePoolInfo(data.token, data.pid)
            return;
        }
        return
    }

    updatePoolInfo = async (_token, _pid) =>{
        var balance = await this.lpTokenInfo[_token].contract.balanceOf(this.web3I.getSelectedAccount());

        this.lpTokenInfo[_token].balance = Number(this.utils.fromWei(balance.toString(), `ether`)).toFixed(5)

        //console.log(` token balance: ${this.lpTokenInfo[_token].balance}`)

        var userInfo = await this.masterChef.userInfo(_pid, this.web3I.getSelectedAccount());

        this.lpTokenInfo[_token].staked= Number(this.utils.fromWei(userInfo.amount.toString(), 'ether')).toFixed(5);

        var earned = await this.masterChef.pendingClout(_pid, this.web3I.getSelectedAccount())

        this.lpTokenInfo[_token].earned = Number(this.utils.fromWei(earned.toString(), `ether`)).toFixed(5);

        this.cards();
    }

    farmSegment(){

        let content = <div id='farmSegment'>
                        {this.state.connectedContent}
                        {this.state.header}
                        <Card.Group centered>
                            {this.state.cards}
                        </Card.Group>
                    </div>

        return content
    }

    render(){

        var farm = this.farmSegment()

        if(this.props.prod){
            farm = <div id='farmSegment'>
                     <p style={{'font-size': '14pt'}}> DeSo Farm Coming Soon. </p>
                  </div>
        }

        return(
            <Segment style={{overflow:'auto', minHeight: "75vh", maxHeight:"92.25vh", padding: '2em 0em' }}>
                
                <Container>
                    {farm}
                </Container>
            </Segment>
        );
    }
}

export default Farm;