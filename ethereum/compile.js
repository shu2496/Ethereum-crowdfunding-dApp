const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');


//to delete entire build folder
const buildPath = path.resolve( __dirname, 'build');
fs.removeSync(buildPath);

//read "campaign.sol" from "contracts" folder
const campaignPath = path.resolve( __dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf-8');

//use solidity compiler to compiler the contracts
const output = solc.compile(source, 1).contracts; // we only care about the contracts property

// we need to create the build folder
fs.mkdirSync(buildPath);

//there can be many contracts so this "output" variable is holding output of all the contracts
// so now we are seperating out the output of each contract to a different file

for (let contract in output)
{
    fs.outputJsonSync(
        path.resolve(buildPath, contract + '.json'),
        output[contract]
    );
}