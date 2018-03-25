const Web3 = require('web3')
const util = require('ethereumjs-util')
const tx = require('ethereumjs-tx')
const lightwallet = require('eth-lightwallet')
const txutils = lightwallet.txutils
//https://web3js.readthedocs.io/en/1.0/#
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/bX04wRIDomo1TFL3ELaS'))

const configKey = require('./config.key.json')
const walletAddress = configKey['walletAddress']
const walletPrivateKey = `0x${configKey['walletPrivateKey']}`
const votingSol = require('./contract/Voting.json')
const contractAddress = '0xe2faa44a84a7698e49d2fd4531ac4521b904f740'
const abi = JSON.parse(votingSol.abi)

export default class VotingSmartContract {
  constructor() {
    this.viewBalance()
    
  }

  viewBalance() {
    web3.eth.getBalance(walletAddress).then(balance => {
      console.log(`Balance ${walletAddress}: `, web3.utils.fromWei(balance))
    })
  }

  sendRawTransaction(rawTx: object) {
    var transaction = new tx(rawTx)
    transaction.sign(new Buffer(walletPrivateKey, 'hex'))
    var serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction(`0x${serializedTx}`)
  }

  createSmartContractByRaw() {
    return web3.eth
      .getTransactionCount(walletAddress)
      .then(nonce => {
        var rawTx = {
          nonce: nonce,
          gasLimit: 800000,
          gasPrice: 20000000000,
          data: `0x${votingSol.bytecode}`
        }
        return this.sendRawTransaction(rawTx)
      })
      .then(
        result => {
          console.log('Tx hash: ', result)
        },
        error => {
          console.error('Error: ', error)
        }
      )
  }

  contractInteract() {
    var account = web3.eth.accounts.wallet.add(walletPrivateKey)
    var contract = new web3.eth.Contract(abi, contractAddress)
    const query = contract.methods.addCandidate('Nhancv')
    const encodedABI = query.encodeABI()
    web3.eth.getTransactionCount(walletAddress).then(nonce => {
      const tx = {
        nonce: nonce,
        from: walletAddress,
        to: contractAddress,
        gas: 800000,
        gasPrice: web3.utils.toWei('0.0000000001', 'ether'),
        data: encodedABI
      }

      web3.eth.accounts.signTransaction(tx, walletPrivateKey).then(signed => {
        console.log('Signed rawTransaction: ', signed.rawTransaction)
        const tran = web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .on('confirmation', (confirmationNumber, receipt) => {
            console.log('=> confirmation: ' + confirmationNumber)
            if (confirmationNumber == 10) {
              tran.removeListener('confirmation')
            }
          })
          .on('transactionHash', hash => {
            console.log('=> hash')
            console.log(hash)
          })
          .on('receipt', receipt => {
            console.log('=> reciept')
            console.log(receipt)
          })
          .on('error', error => {
            console.error('Error: ', error)
          })
      })
    })
  }

}
