const { expect } = require("chai");
const { ethers, network, getNamedAccounts, deployments } = require("hardhat");
const developmentChains = ["localhost", "hardhat"];
const token = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("Dappazon", () => {
      let contract, deployer, buyer;
      beforeEach(async () => {
        [deployer, buyer] = await ethers.getSigners();
        contract = await ethers.getContractFactory("Dappazon");
        contract = await contract.deploy();
      });
      describe("Deployment", () => {
        it("has a nmae", async () => {
          expect(await contract.name(), "Dappazon");
        });
        it("has correct owner", async () => {
          expect(await contract.getOwner(), deployer);
        });
      });

      describe("Listing", () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        beforeEach(async () => {
          transaction = await contract
            .connect(deployer)
            .list(ID, name, category, image, cost, rating, stock);
          await transaction.wait();
        });
        it("Return correct Attributes", async () => {
          const info = await contract.items(ID);
          expect(info.id).to.equal(ID);
          expect(info.name).to.equal(name);
          expect(info.category).to.equal(category);
          expect(info.image).to.equal(image);
          expect(info.cost).to.equal(cost);
          expect(info.rating).to.equal(rating);
          expect(info.stock).to.equal(stock);
        });
        it("Emit Event for product listing", async () => {
          expect(transaction).to.emit(contract, "List");
        });
      });
      describe("Buy Item", () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        let newStock, gas;
        beforeEach(async () => {
          transaction = await contract
            .connect(deployer)
            .list(ID, name, category, image, cost, rating, stock);
          await transaction.wait();
          transaction = await contract.connect(buyer).buy(ID, { value: cost });
          await transaction.wait();
          newStock = stock - 1;
        });
        it("Stock updated", async () => {
          const info = await contract.items(ID);
          expect(info.stock).to.equal(newStock);
        });
        it("Emit Event for product Bought", async () => {
          expect(transaction).to.emit(contract, "Buy");
        });
        it("Updated Contract balance", async () => {
          const info = await ethers.provider.getBalance(contract.address);
          expect(info).to.equal(cost);
        });
        it("Updates buyer's order count", async () => {
          const info = await contract.orderCount(buyer.address);
          expect(info).to.equal(1);
        });
        it("Adds the order", async () => {
          const order = await contract.orders(buyer.address, 1);
          expect(parseInt(order.time)).to.be.greaterThan(0);
          expect(order.item.name).to.equal(name);
        });
      });
      describe("Withdraw", () => {
        let transaction;
        const ID = 1;
        const name = "One Plus 3T";
        const category = "mobile";
        const image = "img";
        const cost = token(20);
        const rating = 5;
        const stock = 100;
        let balanceBefore;
        beforeEach(async () => {
          transaction = await contract
            .connect(deployer)
            .list(ID, name, category, image, cost, rating, stock);
          await transaction.wait();
          transaction = await contract.connect(buyer).buy(ID, { value: cost });
          await transaction.wait();
          balanceBefore = await ethers.provider.getBalance(deployer.address);
          transaction = await contract.connect(deployer).withdraw();
          await transaction.wait();
        });
        it("Withdrawl successfull", async () => {
          const contractBalance = await ethers.provider.getBalance(
            contract.address
          );
          expect(contractBalance).to.equal(0);
        });
        it("deployer's address updated", async () => {
          const balanceAfter = await ethers.provider.getBalance(
            deployer.address
          );
          expect(parseInt(balanceAfter)).to.be.greaterThan(parseInt(balanceBefore));
        });
      });
    });
