// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MultiSig is Initializable {
  event TransactionCreated(address indexed creator, address indexed to, uint value, uint txId);
  event TransactionConfirmed(uint txId, address by, uint currentConfirmations);
  event TransactionExecuted(uint txId);
  event TransactionRejected(uint txId, address by);
  event ConfirmationRevoked(uint txId, address by);
  event DepositReceived(uint contractBalance);

  address[3] public members;

  uint128 nextTxId;
  uint8 threshold;

  // Re-entrancy guard
  bool locked;

  struct Transaction {
    address to;
    uint value; // in ETH
    uint confirmations;
    uint rejections;
    bool executed;
    bool rejected;
  }

  mapping(uint => Transaction) idToTx;
  mapping(address => bool) public isMember;
  mapping(uint => mapping(address => bool)) confirmedByMember;
  mapping(uint => mapping(address => bool)) rejectedByMember;

  // Check if function caller is member of the group
  modifier onlyMember() {
    require(isMember[msg.sender], "Not a member.");
    _;
  }

  // Check if member has confirmed transaction or not
  modifier notConfirmed(uint _txId) {
    require(!confirmedByMember[_txId][msg.sender], "You have already confirmed the transaction.");
    _;
  }

  modifier confirmed(uint _txId) {
    require(confirmedByMember[_txId][msg.sender], "You never confirmed the transaction.");
    _;
  }

  modifier notRejected(uint _txId) {
    require(!rejectedByMember[_txId][msg.sender], "You have already rejected the transaction.");
    _;
  }

  // Check if transaction is executed or not
  modifier inProgress(uint _txId) {
    require(!idToTx[_txId].executed, "Transaction has already been executed.");
    require(!idToTx[_txId].rejected, "Transaction has already been rejected");
    _;
  }

  modifier hasTx(uint _txId) {
    require(_txId < nextTxId, "Transaction does not exist.");
    _;
  }

  modifier enoughConfirmations(uint _txId) {
    require(idToTx[_txId].confirmations >= threshold, "Not enough confirmations.");
    _;
  }

  modifier enoughBalance(uint _txId) {
    require(address(this).balance >= idToTx[_txId].value);
    _;
  }

  function initialize(address[3] memory _members, uint _threshold) external initializer {
    require(_threshold >= 2, "Threshold must be at least half of total members");

    for (uint i = 0; i < _members.length; i++) {
      address member = _members[i];
      require(member != address(0), "Invalid address of member.");
      require(!isMember[member], "Member not unique.");

      members[i] = member;
      isMember[member] = true;
    }

    threshold = uint8(_threshold);
  }

  // Receive ether
  receive() external payable {
    emit DepositReceived(msg.value);
  }

  fallback() external payable {
    emit DepositReceived(msg.value);
  }

  function createTransaction(address _to, uint _value) onlyMember external returns (uint) {
    uint amount = _value * 10 ** 18; // to wei
    // Save id to memory for multiple accesses to save gas
    uint txId = nextTxId;

    Transaction memory _tx = Transaction(_to, amount, 1, 0, false, false);
    idToTx[txId] = _tx;
    confirmedByMember[txId][msg.sender] = true;
    nextTxId++;

    emit TransactionCreated(msg.sender, _to, _value, txId);

    return txId;
  }

  function confirmTransaction(uint _txId) onlyMember notConfirmed(_txId) notRejected(_txId) inProgress(_txId) hasTx(_txId) external {
    Transaction storage _tx = idToTx[_txId];
    _tx.confirmations++;
    confirmedByMember[_txId][msg.sender] = true;

    emit TransactionConfirmed(_txId, msg.sender, _tx.confirmations);
  }

  function executeTransaction(uint _txId) onlyMember enoughConfirmations(_txId) enoughBalance(_txId) hasTx(_txId) external {
    require(!locked, "Re-entrancy detected.");
    locked = true;
    Transaction storage _tx = idToTx[_txId];
    address recepient = _tx.to;
    (bool status, ) = recepient.call{value: _tx.value}("");
    require(status, "Transaction failed.");
    _tx.executed = true;
    locked = false;

    emit TransactionExecuted(_txId);
  }

  function revokeConfirmation(uint _txId) onlyMember inProgress(_txId) confirmed(_txId) hasTx(_txId) external {
    Transaction storage _tx = idToTx[_txId];
    _tx.confirmations--;
    confirmedByMember[_txId][msg.sender] = false;

    emit ConfirmationRevoked(_txId, msg.sender);
  }

  function rejectTransaction(uint _txId) onlyMember hasTx(_txId) notConfirmed(_txId) inProgress(_txId) notRejected(_txId) external {
    Transaction storage _tx = idToTx[_txId];
    _tx.rejections++;
    rejectedByMember[_txId][msg.sender] = true;

    if (_tx.rejections >= threshold) {
      _tx.rejected = true;
    }

    emit TransactionRejected(_txId, msg.sender);
  }

  function checkMember(address _address) public view returns (bool) {
    return isMember[_address];
  }

  function getTransaction(uint _txId) public view returns (Transaction memory) {
    require(_txId < nextTxId, "Transaction does not exist");
    return idToTx[_txId];
  }

  function getBalance() public view returns (uint) {
    return address(this).balance / 10 ** 18;
  }

  function getMembers() public view returns (address[3] memory) {
    return members;
  }
}
