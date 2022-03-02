pragma solidity ^0.8.0;

contract MultiSig {
  address[5] public members;

  mapping(address => bool) public isMember;
}
