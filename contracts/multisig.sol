// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;

contract MultiSig {
  event TransactionCreated(address indexed creator, address indexed to, uint value, uint txId);
  event TransactionConfirmed(uint txId, address by, uint currentConfirmations);
  event TransactionExecuted(uint txId);

  address[5] public members;

  uint nextTxId;
  // no need to use uint8 as there are no other variables for packing
  uint requiredConfirmations = 3;

  struct Transaction {
    address creator;
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
    require(_txId < nextTxId, "Transaction does not exist.");
    require(!confirmedByMember[_txId][msg.sender], "You have already confirmed the transaction.");
    _;
  }

  // Check if transaction is executed or not
  modifier inProgress(uint _txId) {
    require(_txId < nextTxId, "Transaction does not exist.");
    require(!idToTx[_txId].executed, "Transaction has already been executed.");
    _;
  }

  modifier hasEnoughConfirmations(uint _txId) {
    require(idToTx[_txId].confirmations >= 3, "Not enough confirmations.");
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

  // Receive ether
  receive() external payable {}

  function createTransaction(address _to, uint _value) onlyOwner external {
    // Save id to memory for multiple accesses to save gas
    uint txId = nextTxId;

    Transaction memory _tx = Transaction(msg.sender, _to, _value, 1, false);
    idToTx[txId] = _tx;
    confirmedByMember[txId][msg.sender] = true;
    nextTxId++;

    emit TransactionCreated(msg.sender, _to, _value, txId);
  }


}
