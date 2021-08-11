import Web3 from "web3";

const INFURA_URL =
  "https://rinkeby.infura.io/v3/91a49c8a855943b3914cee79f438a081";
let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  // We are in the browser and metamask is running.
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider(INFURA_URL);
  web3 = new Web3(provider);
}

export default web3;