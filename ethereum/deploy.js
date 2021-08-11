const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compiledFactory = require("./build/CampaignFactory.json");

const MNEMONIC =
  "road breeze enhance urge birth subject device eye fork cat broccoli leg";
const INFURA_URL =
  "https://rinkeby.infura.io/v3/91a49c8a855943b3914cee79f438a081";

const provider = new HDWalletProvider(MNEMONIC, INFURA_URL);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: "1000000", from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
};
