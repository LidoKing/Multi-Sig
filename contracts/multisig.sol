pragma solidity ^0.8.0;

contract MultiSig {
  address[5] public members;

  uint[] txIds;
  // no need to use uint8 as there are no other variables for packing
  uint requiredConfirmations = 3;

  struct Transaction {
    address initiator,
    address to,
    uint value,
    uint confirmations,
    bool executed
  }

  mapping(uint => Transaction) idToTx;
  mapping(address => bool) public isMember;

  constructor(address[5] memory _members) {
    for (uint i = 0, i < 5, i++) {
      members[i] = _members[i];
    }
  }
}
