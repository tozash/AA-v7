const hre = require("hardhat");

const ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const PAYMASTER_ADDRESS = "0x61218C22Afa374f5ed5468dB927b8ccbc2A05b5a";

async function main() {

    const ep = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);

    await ep.depositTo(PAYMASTER_ADDRESS,
        {value: hre.ethers.parseEther(".5")}
        );

    console.log("Deposited to paymaster");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});