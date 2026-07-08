// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CopyrightRegistry
/// @notice Educational registry for immutable digital copyright records.
/// @dev This contract is not an NFT, token, marketplace, or payment system.
contract CopyrightRegistry {
    struct Copyright {
        uint256 id;
        address creator;
        string title;
        string category;
        string description;
        string fileHash;
        string externalURL;
        uint256 timestamp;
        bool approved;
        uint256 approvedAt;
    }

    address public reviewer;
    uint256 public totalWorks;

    mapping(uint256 => Copyright) public copyrights;
    mapping(address => uint256[]) public creatorWorks;

    event CopyrightSubmitted(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 timestamp
    );

    event CopyrightApproved(
        uint256 indexed id,
        address indexed reviewer,
        uint256 approvedAt
    );

    error CopyrightDoesNotExist(uint256 id);
    error NotReviewer(address caller);
    error CopyrightAlreadyApproved(uint256 id);

    constructor(address initialReviewer) {
        require(initialReviewer != address(0), "Reviewer cannot be zero address");
        reviewer = initialReviewer;
    }

    modifier onlyReviewer() {
        if (msg.sender != reviewer) {
            revert NotReviewer(msg.sender);
        }
        _;
    }

    /// @notice Submit a new copyright record for reviewer approval.
    /// @dev The file itself is not stored. Only its hash fingerprint is recorded.
    function registerCopyright(
        string memory title,
        string memory category,
        string memory description,
        string memory fileHash,
        string memory externalURL
    ) public returns (uint256) {
        totalWorks++;

        Copyright memory newCopyright = Copyright({
            id: totalWorks,
            creator: msg.sender,
            title: title,
            category: category,
            description: description,
            fileHash: fileHash,
            externalURL: externalURL,
            timestamp: block.timestamp,
            approved: false,
            approvedAt: 0
        });

        copyrights[totalWorks] = newCopyright;
        creatorWorks[msg.sender].push(totalWorks);

        emit CopyrightSubmitted(totalWorks, msg.sender, title, block.timestamp);

        return totalWorks;
    }

    /// @notice Approve a pending copyright application.
    /// @dev Only the configured reviewer wallet can approve records.
    function approveCopyright(uint256 id) public onlyReviewer {
        if (id == 0 || id > totalWorks) {
            revert CopyrightDoesNotExist(id);
        }

        if (copyrights[id].approved) {
            revert CopyrightAlreadyApproved(id);
        }

        copyrights[id].approved = true;
        copyrights[id].approvedAt = block.timestamp;

        emit CopyrightApproved(id, msg.sender, block.timestamp);
    }

    /// @notice Read a copyright certificate by its numeric on-chain ID.
    function getCopyright(uint256 id) public view returns (Copyright memory) {
        if (id == 0 || id > totalWorks) {
            revert CopyrightDoesNotExist(id);
        }

        return copyrights[id];
    }

    /// @notice Return all copyright IDs created by the caller wallet.
    function getMyCopyrights() public view returns (uint256[] memory) {
        return creatorWorks[msg.sender];
    }

    /// @notice Return copyright IDs that are still waiting for reviewer approval.
    /// @dev This is intentionally simple for a small educational demo.
    function getPendingCopyrights() public view returns (uint256[] memory) {
        uint256 pendingCount = 0;

        for (uint256 id = 1; id <= totalWorks; id++) {
            if (!copyrights[id].approved) {
                pendingCount++;
            }
        }

        uint256[] memory pendingIds = new uint256[](pendingCount);
        uint256 index = 0;

        for (uint256 id = 1; id <= totalWorks; id++) {
            if (!copyrights[id].approved) {
                pendingIds[index] = id;
                index++;
            }
        }

        return pendingIds;
    }

    /// @notice Return the number of registered works.
    function getTotalWorks() public view returns (uint256) {
        return totalWorks;
    }
}
