import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const DEPLOYED_FACTORY_ADDRESS_ON_INFURA =
  "0x9Adf623185b92964dE7b4e134371898bc9b15e93";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  DEPLOYED_FACTORY_ADDRESS_ON_INFURA
);

export default instance;