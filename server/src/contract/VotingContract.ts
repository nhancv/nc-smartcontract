const Web3 = require('web3')

/**
 * https://web3js.readthedocs.io/en/1.0/#
wss://mainnet.infura.io/ws
wss://ropsten.infura.io/ws
wss://rinkeby.infura.io/ws
 */
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'))

const configKey = require('../config/config.key.json')
const walletAddress = configKey['walletAddress']
const walletPrivateKey = `0x${configKey['walletPrivateKey']}`
const votingSol = require('./Voting.json')
const account = web3.eth.accounts.wallet.add(walletPrivateKey)
const gas = 800000
const gasPrice = web3.utils.toWei('0.0000000002', 'ether')
export default class VotingContract {
  contractAddress
  contract
  constructor() {
    this.initContract()
    this.viewBalance()
    this.addCandidateEventContract()
    this.voteCandidateEventContract()
    this.getCandidateListContract().then(list => {
      console.log(list)
    })
  }

  viewBalance() {
    web3.eth.getBalance(walletAddress).then(balance => {
      console.log(`Balance ${walletAddress}: `, web3.utils.fromWei(balance, 'ether'))
    })
  }

  initContract(contractAddress = '0xa2db71249c0548b8a1a82b2233d9254d9944fb63') {
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
      this.contract.methods.getNumberCandidate().call((err, res) => {
        console.log('Candidate List: ', res)

        let requestList: any = []
        for (let i = 0; i < res; i++) {
          requestList.push(
            new Promise((resolve1, reject1) => {
              this.contract.methods.candidateList(i).call((err1, res1) => {
                if (err1) {
                  reject1(err1)
                } else {
                  resolve1({
                    id: res1.id,
                    name: res1.name
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

  ///////////////////// EVENT ///////////////////////
  voteCandidateEventContract() {
    this.contract.events
      .VoteCandidateEvent()
      .on('data', event => {
        console.log(event) // same results as the optional callback above
      })
      .on('changed', event => {
        // remove event from local database
      })
      .on('error', console.error)
  }

  addCandidateEventContract() {
    this.contract.events
      .AddCandidateEvent({ fromBlock: 0 }, (err, res) => {
        if (err) {
          console.error(err)
        } else {
          console.log(res)
        }
      })
      .on('data', event => {
        console.log(event) // same results as the optional callback above
      })
      .on('changed', event => {
        // remove event from local database
      })
      .on('error', console.error)
  }
}
