/**
https://web3js.readthedocs.io/en/1.0/#
wss://mainnet.infura.io/ws
wss://ropsten.infura.io/ws
wss://rinkeby.infura.io/ws
 */

export default class Contract {
  web3
  configKey
  walletAddress
  walletPrivateKey
  contract
  contractAddress
  account
  gas
  gasPrice
  constructor() {
    let Web3 = require('web3')
    this.configKey = require('../config/config.key.json')
    // this.web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'))
    this.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'))
    this.walletAddress = this.configKey['walletAddress']
    this.walletPrivateKey = `0x${this.configKey['walletPrivateKey']}`
    this.account = this.web3.eth.accounts.wallet.add(this.walletPrivateKey)
    this.gas = 800000
    this.gasPrice = 25000000000
    this.web3.eth.getGasPrice().then(gasPrice => {
      this.gasPrice = gasPrice
    })
  }

  viewBalance() {
    return this.web3.eth.getBalance(this.walletAddress)
  }

  initContract(contractAddress, api) {
    this.contractAddress = contractAddress
    this.contract = new this.web3.eth.Contract(api, this.contractAddress)
  }

  createSmartContract(bytecode, abi) {
    const encodedABI = `0x${bytecode}`
    this.web3.eth.getTransactionCount(this.walletAddress).then(nonce => {
      const tx = {
        nonce: nonce,
        from: this.walletAddress,
        gas: this.gas,
        gasPrice: this.gasPrice,
        data: encodedABI
      }

      this.signTransaction(tx, receipt => {
        console.log('=> reciept', receipt)
        this.initContract(receipt.contractAddress, abi)
      })
    })
  }

  signTransaction(tx, receiptCb?: Function) {
    this.web3.eth.accounts.signTransaction(tx, this.walletPrivateKey).then(signed => {
      console.log('Signed rawTransaction: ', signed.rawTransaction)
      const tran = this.web3.eth
        .sendSignedTransaction(signed.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log('=> confirmation: ' + confirmationNumber)
          if (confirmationNumber == 10) {
            tran.removeListener('confirmation')
          }
        })
        .on('transactionHash', hash => {
          console.log('=> hash', hash)
        })
        .on('receipt', receipt => {
          console.log('=> reciept', receipt)
          if (receiptCb) receiptCb(receipt)
        })
        .on('error', error => {
          console.error('Error: ', error)
        })
    })
  }
}
