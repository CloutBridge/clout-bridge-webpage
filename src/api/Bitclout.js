const axios = require('axios');

var axiosI = axios.create({
    baseURL: 'https://api.bitclout.com',
    timeout: 1000000,
    headers: 
    {
      'apiKey': "DCEB26AC8BF47F1D7B4D87440EDCA6",
      'content-type': "application/json"
  } 
})

const apiURL = 'https://api.bitclout.com'

var path0 = "/api/v0/";
var path1= "/api/v1/"; 


balance  = async (_address) =>{
    var options ={
        method: "POST",
        url: path1 + 'balance',
        timeout: 15000,
        data:{
            PublicKeyBase58Check: _address
        }
    }

    var balance = axiosI.request(options).then((result) =>{
        return result.data.ConfirmedBalanceNanos + result.data.UnconfirmedBalanceNanos
    })

    return balance;
}

block = async (_height) =>{
    var options = {
        url: path1 + 'block',
        method: 'POST',
        timeout: 15000,
        data: {
            Height: _height,
            FullBlock: true
        }
    }

    var block = axiosI.request(options).then((result) =>{
        return result.data
    })

    return block;
}

headBlock = async () =>{
    var options = {
        url: path1,
        method: 'GET',
        timeout: 15000
    }

    var head = axiosI.request(options).then((result) =>{
        return result.data;
    })

    return head;
}


module.exports = {balance, block, headBlock}