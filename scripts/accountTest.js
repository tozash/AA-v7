const { ethers } = require("hardhat");

const ACCOUNT_ADDRESS = "0x0a12F0F6c479a73D448638BBC909A14A1bD98C20";

async function main() {
    const account = await ethers.getContractAt("Account", ACCOUNT_ADDRESS);
    const count = await account.count();
    console.log(`Count: ${count}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
