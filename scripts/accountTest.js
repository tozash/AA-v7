const { ethers } = require("hardhat");

const ACCOUNT_ADDRESS = "0x07371De00A00609b42EAf2F1f01619Aae4C00361";

async function main() {
    const account = await ethers.getContractAt("Account", ACCOUNT_ADDRESS);
    const count = await account.count();
    console.log(`Count: ${count}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
