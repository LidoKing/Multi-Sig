# Basic multi-sig wallet written in solidity

A wallet owned by a group of 5 people. Requires at least 3 out 5 members' consent in order to execute or reject transaction. A member's confirmation to a transaction can be revoked but rejection cannot. Transaction will be rejected automatically when the third rejection is made, while transaction execution has to be done manually.

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
