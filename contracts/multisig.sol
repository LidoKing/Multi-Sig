pragma solidity ^0.8.0;

contract MultiSig {
  address[5] public members;

  uint[] txIds;
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
}
