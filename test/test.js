const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  this.timeout(50000);

  let myNFT;
  let owner;
  let acc1;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const MyNFT = await ethers.getContractFactory("Oshiakwo");
    [owner, acc1] = await ethers.getSigners();

    myNFT = await MyNFT.deploy();
  });


  it("Should store and mint one NFT", async function () {
    const tokenURI = "https://example.com/1";
    const price = 2;
    const name = "Style1";
    const tx = await myNFT.connect(owner).storeStyle(name, price, tokenURI);
    await tx.wait();

    expect(await myNFT.totalSupply()).to.equal(1);
  });

  it("Should request a swap", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";
    const price_1 = 2;
    const price_2 = 2;
    const name_1 = "Style1";
    const name_2 = "Style2";

    const tx1 = await myNFT.connect(owner).storeStyle(name_1, price_1, tokenURI_1);
    await tx1.wait();

    const tx2 = await myNFT.connect(acc1).storeStyle(name_2, price_2, tokenURI_2);
    await tx2.wait();

    const req = await myNFT.connect(owner).requestSwap(0, 1);
    await req.wait();

    const isReq = await myNFT.connect(acc1).styles(1);
    // await isReq.wait();

    expect(await myNFT.requests(1)).to.equal(owner.address);
    expect(await isReq.swapRequest).to.equal(true);
  });

  it("Should approve a swap", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";
    const price_1 = 2;
    const price_2 = 2;
    const name_1 = "Style1";
    const name_2 = "Style2";

    const tx1 = await myNFT.connect(owner).storeStyle(name_1, price_1, tokenURI_1);
    await tx1.wait();

    const tx2 = await myNFT.connect(acc1).storeStyle(name_2, price_2, tokenURI_2);
    await tx2.wait();

    const req = await myNFT.connect(owner).requestSwap(0, 1);
    await req.wait();

    const approve = await myNFT.connect(acc1).approveSwap(0, 1);
    await approve.wait();

    const isReq = await myNFT.connect(acc1).styles(1);
    // await isReq.wait();

    expect(await myNFT.ownerOf(1)).to.equal(owner.address);
    expect(await myNFT.ownerOf(0)).to.equal(acc1.address);
    expect(await isReq.swapRequest).to.equal(false);
  });

});