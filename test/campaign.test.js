const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: "1000000" });

  //first element in the array of addresses returned
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  //load the campaign at the address
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it("allows people to contribute and mark them as approver", async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1]
    });

    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "100",
        from: accounts[1]
      });
      assert(false);
    } catch (e) {
      assert(e.message.includes("revert"));
    }
  });

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Buy batteries", "100", accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000"
      });

    const request = await campaign.methods.requests(0).call();
    assert.equal("Buy batteries", request.description);
  });

  it("processes requests", async () => {
    const manager = accounts[0];
    const approver = accounts[1];
    const recipient = accounts[2];
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei("10", "ether")
    });

    await campaign.methods
      .createRequest("Something", web3.utils.toWei("5", "ether"), recipient)
      .send({
        from: manager,
        gas: "1000000"
      });

    await campaign.methods.approveRequest(0).send({
      from: approver,
      gas: "1000000"
    });

    let recipientBalance = await web3.eth.getBalance(recipient);
    recipientBalance = web3.utils.fromWei(recipientBalance, "ether");
    recipientBalance = parseFloat(recipientBalance);
    assert.equal(100, recipientBalance); // balance before

    await campaign.methods.finalizeRequest(0).send({
      from: manager,
      gas: "1000000"
    });

    recipientBalance = await web3.eth.getBalance(recipient);
    recipientBalance = web3.utils.fromWei(recipientBalance, "ether");
    recipientBalance = parseFloat(recipientBalance);
    assert.equal(105, recipientBalance); // balance after
  });
});