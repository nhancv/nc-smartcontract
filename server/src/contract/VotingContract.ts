import Contract from './Contract'

const votingSol = require('./Voting.json')
export default class VotingContract extends Contract {
  constructor() {
    super()
    this.initContract('0xa2db71249c0548b8a1a82b2233d9254d9944fb63', JSON.parse(votingSol.abi))
    this.viewBalance().then(balance => {
      console.log(`Balance ${this.walletAddress}: `, this.web3.utils.fromWei(balance, 'ether'))
    })
    this.addCandidateEventContract()
    this.voteCandidateEventContract()
    this.getCandidateListContract().then(list => {
      console.log(list)
    })
    // this.addCandidateContract('Test10')
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

  addCandidateContract(candidate: string) {
    const encodedABI = this.contract.methods.addCandidate(candidate).encodeABI()
    this.web3.eth.getTransactionCount(this.walletAddress).then(nonce => {
      const tx = {
        nonce: nonce,
        from: this.walletAddress,
        to: this.contractAddress,
        gas: this.gas,
        gasPrice: this.gasPrice,
        data: encodedABI
      }

      this.signTransaction(tx)
      
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
