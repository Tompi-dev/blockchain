// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Week4Token {
    string public name = "Week4 Token";
    string public symbol = "W4T";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "zero address");
        require(balanceOf[msg.sender] >= amount, "insufficient balance");

        // edge case: transfer to yourself is allowed (it just subtracts/adds back)
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
