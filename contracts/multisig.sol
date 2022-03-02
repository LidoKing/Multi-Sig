// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;

contract MultiSig {
  event TransactionCreated(address indexed creator, address indexed to, uint value, uint txId);
  event TransactionConfirmed(uint txId, address by, uint currentConfirmations);
  event TransactionExecuted(uint txId);
  event ConfirmationRevoked(uint txId, address by);
  event DepositReceived(uint contractBalance);

  address[5] public members;

  uint nextTxId;
  // no need to use uint8 as there are no other variables for packing
  uint requiredConfirmations = 3;

  // Re-entrancy guard
  bool locked;

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
    require(idToTx[_txId].confirmations >= requiredConfirmations, "Not enough confirmations.");
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
  receive() external payable {
    emit DepositReceived(address(this).balance);
  }

  function createTransaction(address _to, uint _value) onlyOwner external {
    require(address(this).balance >= _value, "Not enough money in wallet.");
    // Save id to memory for multiple accesses to save gas
    uint txId = nextTxId;

    Transaction memory _tx = Transaction(msg.sender, _to, _value, 1, false);
    idToTx[txId] = _tx;
    confirmedByMember[txId][msg.sender] = true;
    nextTxId++;

    emit TransactionCreated(msg.sender, _to, _value, txId);
  }

  function confirmTransaction(uint _txId) onlyOwner notConfirmed(_txId) inProgress(_txId) external {
    Transaction storage _tx = idToTx[_txId];
    _tx.confirmations++;
    confirmedByMember[_txId][msg.sender] = true;

    emit TransactionConfirmed(_txId, msg.sender, _tx.confirmations);
  }

  function executeTransaction(uint _txId) onlyOwner hasEnoughConfirmations(_txId) external {
    require(!locked, "Re-entrancy detected.");
    locked = true;
    Transaction storage _tx = idToTx[_txId];
    address receiver = _tx.to;
    (bool status, ) = receiver.call{value: _tx.value}("");
    require(status, "Transaction failed.");
    _tx.executed = true;

    emit TransactionExecuted(_txId);
    locked = false;
  }

  function revokeConfirmation(uint _txId) onlyOwner inProgress(_txId) external {
    Transaction storage _tx = idToTx[_txId];
    _tx.confirmations--;
    confirmedByMember[_txId][msg.sender] = false;

    emit ConfirmationRevoked(_txId, msg.sender);
  }

  function checkMember(address _address) public view returns (bool) {
    return isMember[_address];
  }
}
