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
const account = web3.eth.accounts.wallet.add(walletPrivateKey)
const gas = 800000
const gasPrice = web3.utils.toWei('0.0000000002', 'ether')
export default class VotingSmartContract {
  contractAddress
  contract
  constructor() {
    this.initContract()
    this.viewBalance()
    // this.addCandidateContract()
    this.getCandidateListContract().then(list => {
      console.log(list)
    })
  }

  viewBalance() {
    web3.eth.getBalance(walletAddress).then(balance => {
      console.log(`Balance ${walletAddress}: `, web3.utils.fromWei(balance))
    })
  }

  initContract(contractAddress = '0xF5e61E94627dA3fAa63aaE3B946321C13Ab1103e') {
    this.contractAddress = contractAddress
    this.contract = new web3.eth.Contract(JSON.parse(votingSol.abi), this.contractAddress)
  }

  createSmartContract() {
    const encodedABI = `0x${votingSol.bytecode}`
    web3.eth.getTransactionCount(walletAddress).then(nonce => {
      const tx = {
        nonce: nonce,
        from: walletAddress,
        gas: gas,
        gasPrice: gasPrice,
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
            this.initContract(receipt.contractAddress)
          })
          .on('error', error => {
            console.error('Error: ', error)
          })
      })
    })
  }

  getCandidateListContract() {
    return new Promise((resolve, reject) => {
      var candidateList: any = []
      this.contract.methods.getNumberCandidate().call((err, res) => {
        console.log('Candidate List: ', res)

        let requestList: any = []
        for (let i = 0; i < res; i++) {
          requestList.push(
            new Promise((resolve, reject) => {
              this.contract.methods.candidateList(i).call((err, res) => {
                if (err) {
                  reject(err)
                } else {
                  resolve({
                    id: res.id,
                    name: res.name
                  })
                }
              })
            })
          )
        }
        Promise.all(requestList).then(
          candidateList => {
            resolve(candidateList)
          },
          error => reject(error)
        )
      })
    })
  }

  addCandidateContract() {
    const encodedABI = this.contract.methods.addCandidate('Nhancv').encodeABI()
    web3.eth.getTransactionCount(walletAddress).then(nonce => {
      const tx = {
        nonce: nonce,
        from: walletAddress,
        to: this.contractAddress,
        gas: gas,
        gasPrice: gasPrice,
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
