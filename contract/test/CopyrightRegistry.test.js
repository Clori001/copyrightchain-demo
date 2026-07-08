const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("CopyrightRegistry", function () {
  async function deployRegistry() {
    const [creator, otherCreator] = await ethers.getSigners();
    const CopyrightRegistry = await ethers.getContractFactory("CopyrightRegistry");
    const registry = await CopyrightRegistry.deploy(creator.address);

    return { registry, creator, otherCreator };
  }

  const demoRecord = {
    title: "Sunset at Mountain Lake",
    category: "Photography",
    description: "A sunset view captured during a mountain trip.",
    fileHash: "0x82a92bd82929f18bc3e5d7a91af0b2c3d4e5f678",
    externalURL: "https://example.com/sunset-at-mountain-lake"
  };

  it("allows a user to register copyright", async function () {
    const { registry } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    expect(await registry.totalWorks()).to.equal(1);
    expect(await registry.getTotalWorks()).to.equal(1);
  });

  it("stores the creator address correctly", async function () {
    const { registry, creator } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    const record = await registry.getCopyright(1);
    expect(record.creator).to.equal(creator.address);
    expect(record.approved).to.equal(false);
  });

  it("stores the file hash correctly", async function () {
    const { registry } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    const record = await registry.getCopyright(1);
    expect(record.fileHash).to.equal(demoRecord.fileHash);
  });

  it("emits CopyrightSubmitted after registration", async function () {
    const { registry, creator } = await deployRegistry();

    await expect(
      registry.registerCopyright(
        demoRecord.title,
        demoRecord.category,
        demoRecord.description,
        demoRecord.fileHash,
        demoRecord.externalURL
      )
    )
      .to.emit(registry, "CopyrightSubmitted")
      .withArgs(1, creator.address, demoRecord.title, anyValue);
  });

  it("allows the reviewer to approve a pending application", async function () {
    const { registry, creator } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    await expect(registry.approveCopyright(1))
      .to.emit(registry, "CopyrightApproved")
      .withArgs(1, creator.address, anyValue);

    const record = await registry.getCopyright(1);
    expect(record.approved).to.equal(true);
    expect(record.approvedAt).to.be.greaterThan(0);
  });

  it("rejects approval from non-reviewer wallets", async function () {
    const { registry, otherCreator } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    await expect(registry.connect(otherCreator).approveCopyright(1))
      .to.be.revertedWithCustomError(registry, "NotReviewer")
      .withArgs(otherCreator.address);
  });

  it("returns pending copyright IDs", async function () {
    const { registry } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    expect(await registry.getPendingCopyrights()).to.deep.equal([1n]);

    await registry.approveCopyright(1);
    expect(await registry.getPendingCopyrights()).to.deep.equal([]);
  });

  it("rejects invalid IDs", async function () {
    const { registry } = await deployRegistry();

    await expect(registry.getCopyright(1))
      .to.be.revertedWithCustomError(registry, "CopyrightDoesNotExist")
      .withArgs(1);
  });

  it("returns the caller's registered IDs", async function () {
    const { registry, otherCreator } = await deployRegistry();

    await registry.registerCopyright(
      demoRecord.title,
      demoRecord.category,
      demoRecord.description,
      demoRecord.fileHash,
      demoRecord.externalURL
    );

    await registry.connect(otherCreator).registerCopyright(
      "Peaceful Piano Melody",
      "Music",
      "Short demo melody.",
      "0x91af0b2c3d4e5f67882a92bd82929f18bc3e5d7a",
      ""
    );

    expect(await registry.getMyCopyrights()).to.deep.equal([1n]);
    expect(await registry.connect(otherCreator).getMyCopyrights()).to.deep.equal([2n]);
  });
});
