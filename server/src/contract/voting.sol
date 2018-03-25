pragma solidity 0.4.21;


contract Voting {

  // @nhancv: Define candidate 
  struct Candidate {
    uint8 id;
    string name;
    address[] voter;
  }

  // @nhancv: Candidate list
  Candidate[] public candidateList;

  // @nhancv: Event
  event AddCandidateEvent(address indexed from, uint8 candidateId);
  event VoteCandidateEvent(address indexed from, uint8 candidateId);

  // @nhancv: Get length of Candidate list
  function getNumberCandidate() public view returns (uint8) {
    return uint8(candidateList.length);
  }

  // @nhancv: Addition candidate
  function addCandidate(string name) public {
    Candidate memory candidate = Candidate(uint8(candidateList.length), name, new address[](0));
    candidateList.push(candidate);
    emit AddCandidateEvent(msg.sender, candidate.id);
  }

  // @nhancv: Get total vote for candidate
  function getCandidate(uint8 candidateId) public view returns (address[] voter) {
    for (uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i].id == candidateId) {
        return candidateList[i].voter;
      }
    }
    return new address[](0);
  }

  // @nhancv: Vote for candidate
  function voteCandidate(uint8 candidateId) public payable returns (uint8) {
    for (uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i].id == candidateId) {
        address[] storage voterArr = candidateList[i].voter;
        voterArr.push(msg.sender);
        emit VoteCandidateEvent(msg.sender, candidateId);
        return uint8(voterArr.length);
      }
    }
    return 0;
  }

}
