const hre = require("hardhat");

const ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
//const ACCOUNT_ADDRESS = "0x883e21418DFbB439fEBaF06683FFF52AFBc9e842";
const PAYMASTER_ADDRESS = "0x61218C22Afa374f5ed5468dB927b8ccbc2A05b5a";

async function main() {
    const ep = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);
    const pm = await hre.ethers.getContractAt("Paymaster", PAYMASTER_ADDRESS);
    //const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);

    //console.log(`account balance: ${await ep.balanceOf(ACCOUNT_ADDRESS)}`);
    console.log(`paymaster balance: ${await ep.balanceOf(PAYMASTER_ADDRESS)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});