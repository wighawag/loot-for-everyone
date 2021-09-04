// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.7.6;
import "@openzeppelin/contracts/utils/Address.sol";
import "./Ownable.sol";

contract LootVault is Ownable {
    using Address for address;
    using Address for address payable;

    address private immutable _loot;
    constructor(address firstOwner, address loot) Ownable(firstOwner) {
        _loot = loot;
    }

    function sendValue(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != _loot, "LOOT_NOT_AUTHORIZED");
        recipient.sendValue(amount);
    }

    function functionCall(address target, bytes memory data) external onlyOwner returns (bytes memory) {
        require(target != _loot, "LOOT_NOT_AUTHORIZED");
        return target.functionCall(data);
    }

    function functionCallWithValue(address target, bytes memory data, uint256 value) external onlyOwner returns (bytes memory) {
        require(target != _loot, "LOOT_NOT_AUTHORIZED");
        return target.functionCallWithValue(data, value);
    }
}
