import VotingContract from './contract/voting/VotingContract'

const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const log = console.log
var port = process.env.PORT || 4000

// CORS on ExpressJS: https://github.com/expressjs/cors
app.use(cors())

app.get('/', function(req, res) {
  res.redirect('https://nhancv.github.io/nc-smartcontract/home/index.html')
})

app.listen(port, function() {
  log('Server listening at port %d', port)
})

var votingSmartContract: VotingContract = new VotingContract()

