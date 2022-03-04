# Basic multi-sig wallet written in solidity

## Introduction

A wallet owned by a group of 5 people. Requires at least 3 out 5 members' consent in order to execute or reject transaction. A member's confirmation to a transaction can be revoked but rejection cannot. Transaction will be rejected automatically when the third rejection is made, while transaction execution has to be done manually.

Compiled with v8.8.0 solc

## Front-end

To be added...

## Functions

### Create transaction

A transaction contains info about recepient, transaction value, number of confirmations and rejections and the state of transaction (rejected/executed)

```shell
struct Transaction {
  address to;
  uint value; // in ETH
  uint confirmations;
  uint rejections;
  bool executed;
  bool rejected;
}
```

Transaction is tracked by state txId variable that increments for each transaction created

```shell
uint nextTxId;
```

and accessed through mapping

```shell
mapping(uint => Transaction) idToTx;
```

### Confirm transaction

Members' vote on transaction is tracked by nested mappings

```shell
mapping(uint => mapping(address => bool)) confirmedByMember;
mapping(uint => mapping(address => bool)) rejectedByMember;
```

which are used in modifiers

### Revoke confirmation

Members can revote confirmation on a transaction at anytime as long as it has not yet been executed.

### Reject transaction

Transaction is rejected once there are 3 rejections recorded. Rejections, unlike confirmations, cannot be revoked.
Function checks if rejection threshold has been reached at the end of every call and changes transaction state automatically.

### Execute transaction

Transaction execution is done manually. State variable "locked" is changed to true immediately after function is called to prevent re-entrancy, unlocks after transaction has finished.

```shell
bool locked;

function executeTransaction(uint _txId) onlyOwner enoughConfirmations(_txId) enoughBalance(_txId) hasTx(_txId) external {
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
```

## Installation

App built with v16.14.0 node and v8.5.2 npm

```shell
npm init
```
then

```shell
npm install
```

Default hardhat tasks: (shorthand package installed)

```shell
hh accounts
hh compile
hh clean
hh test
hh node
node scripts/sample-script.js
hh help
```
