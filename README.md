# Basic multi-sig wallet written in solidity

## Introduction

A wallet owned by a group of 5 people. Requires at least 3 out 5 members' consent in order to execute or reject transaction. A member's confirmation to a transaction can be revoked but rejection cannot. Transaction will be rejected automatically when the third rejection is made, while transaction execution has to be done manually.

Compiled with v8.8.0 solc

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

Transaction can be created by any members tracked by state txId variable that increments for each transaction created

```shell
uint nextTxId;
```

and accessed through mapping

```shell
mapping(uint => Transaction) idToTx;
```

### Confirm transaction


### Revoke confirmation


### Reject transaction


### Execute transaction

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
