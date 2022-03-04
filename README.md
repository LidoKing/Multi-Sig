# Basic multi-sig wallet written in solidity

A wallet owned by a group of 5 people. Requires at least 3 out 5 members' consent in order to execute or reject transaction. A member's confirmation to a transaction can be revoked but rejection cannot. Transaction will be rejected automatically when 3 rejections are made, while transaction execution has to be done manually.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
