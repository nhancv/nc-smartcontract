import * as React from 'react'
import VotingContract from './Contract/Voting/VotingContract'
import { Candidate } from './Contract/Voting/VotingContract'
import { Header, VotingView } from './Component'
import './App.css'
import Web3 from 'web3'

type AppProps = {}
type AppState = {
  providerValid: boolean
  winner: Candidate
  candicateList: Array<Candidate>
  currentBalance: string
  msgLog: string
}
class App extends React.Component<AppProps, AppState> {
  web3: Web3
  account: string
  contract: VotingContract
  constructor(props: AppProps) {
    super(props)
    this.state = {
      providerValid: false,
      winner: {
        id: 0,
        name: '',
        point: 0
      },
      candicateList: [],
      currentBalance: '',
      msgLog: ''
    }
  }

  componentWillMount() {
    this.initWeb3(res => {
      this.contract = new VotingContract(this.web3, this.account)
      this.setState({ providerValid: res })

      this.getCurrentBalance()
      this.getVotingCandidateList()

    })
  }

  initWeb3 = (cb: any) => {
    if (Web3.givenProvider) {
      this.web3 = new Web3(Web3.givenProvider)

      this.web3.eth.getAccounts((error, accounts) => {
        if (error || accounts.length === 0) {
          cb(false)
        } else {
          this.account = accounts[0]
          this.web3.eth.defaultAccount = this.account
          cb(true)
        }
      })
    } else {
      cb(false)
    }
  }

  getCurrentBalance = () => {
    if (!this.constractReady()) return
    this.contract.viewBalance().then(balance => {
      this.setState({
        currentBalance: `${this.web3.utils.fromWei(balance, 'ether')} ETH`
      })
    })
  }

  addCandidate = (candidate: string) => {
    if (!this.constractReady()) return
    this.setState({
      msgLog: `addCandidate is sending, please wait for confirmation`
    })
    this.contract.addCandidateContract(candidate).then(hashObject => {
      this.setState({
        msgLog: `addCandidate success: 
        <a href="https://ropsten.etherscan.io/tx/${hashObject}" className="alert-link">
        View Detail</a><br/>
        TransactionHash: ${hashObject.transactionHash}<br/>
        BlockHash: ${hashObject.blockNumber}<br/>
        CumulativeGasUsed: ${hashObject.cumulativeGasUsed}<br/>
        GasUsed: ${hashObject.gasUsed}<br/>
        From: ${hashObject.from}<br/>
        To: ${hashObject.to}<br/>
        `
      })
      this.getVotingCandidateList()
    }, error => {
      this.setState({
        msgLog: ''
      })
    })  
  }

  voteCandidate = (candidateId: number) => {
    if (!this.constractReady()) return
    this.setState({
      msgLog: `voteCandidate is sending, please wait for confirmation`
    })
    this.contract.voteCandidateContract(candidateId).then(hashObject => {
      console.log(hashObject)
      this.setState({
        msgLog: `voteCandidate success: 
        <a href="https://ropsten.etherscan.io/tx/${hashObject.transactionHash}" className="alert-link">
        View Detail</a><br/>
        TransactionHash: ${hashObject.transactionHash}<br/>
        BlockHash: ${hashObject.blockNumber}<br/>
        CumulativeGasUsed: ${hashObject.cumulativeGasUsed}<br/>
        GasUsed: ${hashObject.gasUsed}<br/>
        From: ${hashObject.from}<br/>
        To: ${hashObject.to}<br/>
        `
      })
      this.getVotingCandidateList()
    }, error => {
      this.setState({
        msgLog: ''
      })
    })  
  }

  getWinner = (list: Array<Candidate>) => {
    if (!this.constractReady()) return
    this.contract.getWinner().then(winnerId => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === winnerId) {
          this.setState({
            winner: list[i]
          })
        }
      }
    })
  }

  getVotingCandidateList = () => {
    if (!this.constractReady()) return
    this.contract.getCandidateListContract().then(list => {
      this.setState({
        candicateList: list
      })
      this.getWinner(list)
    })
  }
  
  constractReady = (): boolean => {
    if (this.state && this.state.providerValid && this.contract) {
      return true
    }
    return false
  }

  renderContainer = () => {
    if (this.constractReady()) {
      return (
        <VotingView 
          msgLog={this.state.msgLog}
          currentBalance={this.state.currentBalance}
          candidateList={this.state.candicateList} 
          winner={this.state.winner} 
          addCandidateFunc={this.addCandidate}
          voteCandidateFunc={this.voteCandidate}
        />
      )
    } else {
      return (
        <div className="App-invalidProvider">
          <h1>Install Metamask Please</h1>
          <a href="https://metamask.io/">https://metamask.io/</a>
        </div>
      )
    }
    
  }
  render() {
    return (
      <div className="App">
        <Header />

        {this.renderContainer()}
      </div>
    )
  }
}

export default App
