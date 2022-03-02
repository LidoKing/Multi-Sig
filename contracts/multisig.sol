// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;

contract MultiSig {
  address[5] public members;

  uint[] txIds;
  // no need to use uint8 as there are no other variables for packing
  uint requiredConfirmations = 3;

  struct Transaction {
    address initiator;
    address to;
    uint value;
    uint confirmations;
    bool executed;
  }

  mapping(uint => Transaction) idToTx;
  mapping(address => bool) public isMember;
  mapping(uint => mapping(address => bool)) confirmedByMember;

  // Check if function caller is member of the group
  modifier onlyOwner() {
    require(isMember[msg.sender], "Not a member.");
    _;
  }

  // Check if member has confirmed transaction or not
  modifier notConfirmed(uint _txId) {
    require(!confirmedByMember[_txId][msg.sender], "You have already confirmed the transaction.");
    _;
  }

  // Check if transaction is executed or not
  modifier inProgress(uint _txId) {
    require(!idToTx[_txId].executed, "Transaction has already been executed.");
    _;
  }

  constructor(address[5] memory _members) {
    require(_members.length == 5, "Insufficient members to form group.");

    for (uint i = 0; i < 5; i++) {
      address member = _members[i];
      require(member != address(0), "Invalid address of member.");
      require(!isMember[member], "Member not unique.");

      members[i] = member;
      isMember[member] = true;
    }
  }

  /*function createTransaction(address to) onlyOwner external {
    Transaction storage tx = Transaction(msg.sender, msg.value, , 0, false);
  }*/
}
