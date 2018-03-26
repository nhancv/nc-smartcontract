const votingSol = require('./Voting.json')
// const gas = 800000
// const gasPrice = 2000000000

export default class VotingContract {
  web3
  account
  contract
  contractAddress: string
  constructor(web3: any, account: any) {
    this.web3 = web3
    this.account = account
    this.initContract()
    this.viewBalance()
    this.addCandidateContract('Test3')
    this.getCandidateListContract().then(list => {
      console.log(list)
    })
  }

  viewBalance() {
    this.web3.eth.getBalance(this.account).then(balance => {
      console.log(`Balance ${this.account}: `, this.web3.utils.fromWei(balance))
    })
  }

  initContract(contractAddress: string = '0xF5e61E94627dA3fAa63aaE3B946321C13Ab1103e') {
    this.contractAddress = contractAddress
    this.contract = new this.web3.eth.Contract(JSON.parse(votingSol.abi), this.contractAddress)
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

  addCandidateContract(candiate: string) {
    return this.contract.methods.addCandidate(candiate).send({ from: this.account })
  }
}
