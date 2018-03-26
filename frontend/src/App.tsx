import * as React from 'react'
import VotingContract from './voting/VotingContract'

import './App.css'
const Web3 = require('web3')
const logo = require('./logo.svg')
type AppProps = {}
type AppState = { providerValid: boolean }
class App extends React.Component<AppProps, AppState> {
  web3
  account
  contract
  constructor(props: AppProps) {
    super(props)
  }

  componentWillMount() {
    this.initWeb3(res => {
      this.setState({ providerValid: res })
      this.contract = new VotingContract(this.web3, this.account)
    })
  }

  initWeb3(cb: any) {
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {this.state && this.state.providerValid ? null : <p className="App-intro">Install Metamask Please</p>}
      </div>
    )
  }
}

export default App
