const hre = require("hardhat");
require("dotenv").config();

const USER_OP_HASH = "0xea4b31d1d34907c233f7df643d8cd728d237411ffb31d62f19e41c31f51e584b";
const ACCOUNT_ADDRESS = "0x0a12F0F6c479a73D448638BBC909A14A1bD98C20";

async function main() {
  console.log("Checking UserOperation status...");
  
  // Check if the account exists
  const code = await hre.ethers.provider.getCode(ACCOUNT_ADDRESS);
  console.log("Account code length:", code.length);
  console.log("Account exists:", code !== "0x");
  
  if (code !== "0x") {
    console.log("✅ Account exists! Checking count...");
    const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);
    const count = await account.count();
    console.log(`Count: ${count}`);
  } else {
    console.log("❌ Account doesn't exist yet. Checking UserOperation status...");
    
    // Check UserOperation status
    try {
      const status = await hre.ethers.provider.send("eth_getUserOperationByHash", [USER_OP_HASH]);
      console.log("UserOperation status:", status);
      
      if (status && status.transactionHash) {
        console.log("✅ UserOperation was included in transaction:", status.transactionHash);
        
        // Wait for transaction to be mined
        console.log("Waiting for transaction to be mined...");
        const receipt = await hre.ethers.provider.waitForTransaction(status.transactionHash);
        console.log("Transaction mined in block:", receipt.blockNumber);
        
        // Check account again
        const newCode = await hre.ethers.provider.getCode(ACCOUNT_ADDRESS);
        if (newCode !== "0x") {
          console.log("✅ Account now exists!");
          const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);
          const count = await account.count();
          console.log(`Count: ${count}`);
        }
      }
    } catch (error) {
      console.log("UserOperation not found or still pending:", error.message);
      console.log("This means the UserOperation is still in the bundler's mempool waiting to be included in a block.");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 