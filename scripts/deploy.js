const hre = require("hardhat");

const ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

async function main() {


  // Deploy EntryPoint
  // const ep = await hre.ethers.deployContract("EntryPoint");
  
  // await ep.waitForDeployment();

  // console.log(`EP deployed to ${ep.target}`);


  
  // Deploy AccountFactory2
  const af2 = await hre.ethers.deployContract("AccountFactory2", [ENTRYPOINT_ADDRESS]);
  
  await af2.waitForDeployment();

  console.log(`AF2 deployed to ${af2.target}`);



  // Deploy Paymaster
  const pm = await hre.ethers.deployContract("Paymaster");

  await pm.waitForDeployment();

  console.log(`PM deployed to ${pm.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
