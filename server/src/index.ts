import VotingSmartContract from './voting_smart_contract'

const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const log = console.log
var port = process.env.PORT || 4000

// CORS on ExpressJS: https://github.com/expressjs/cors
app.use(cors())

// For fontend route
var frontendDir = path.join(path.dirname(path.dirname(__dirname)), 'frontend')
app.use('/home', express.static(path.join(frontendDir, 'build')))
app.get('/home', function(req, res) {
  res.sendFile(path.join(frontendDir, 'build', 'index.html'))
})
app.get('/', function(req, res) {
  res.redirect('/home')
})

app.listen(port, function() {
  log('Server listening at port %d', port)
})

// var smart_contract_test = require('./smartcontract_test')
var votingSmartContract: VotingSmartContract = new VotingSmartContract()
// votingSmartContract.createSmartContract()
