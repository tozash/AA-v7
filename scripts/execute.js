const hre = require("hardhat");
require("dotenv").config();
const { Alchemy, Network } = require("alchemy-sdk");
const {toBeHex } = require("ethers");

const config = {
  apiKey: process.env.ALCHEMY_KEY, // Replace with your API key
  network: Network.MATIC_AMOY, // Replace with your network
};

const alchemy = new Alchemy(config);


const ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const FACTORY_ADDRESS = "0x754F38096948eC875c040f1990c3A05D35C2640b";
const PAYMASTER_ADDRESS = "0x61218C22Afa374f5ed5468dB927b8ccbc2A05b5a";
const SALT = 12345678;


async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const owner = signer0.address;

  const ep = await hre.ethers.getContractAt("EntryPoint", ENTRYPOINT_ADDRESS);

  const factory = await hre.ethers.getContractAt(
    "AccountFactory2",
    FACTORY_ADDRESS
  );

  // get the predicted address of the account
  const sender = await factory.getPredictedAddress(owner, SALT);

  // get the code of the account
  const code = await hre.ethers.provider.getCode(sender);

  const factoryData = factory.interface
      .encodeFunctionData("createAccount", [owner, SALT]);

  // if the account already exists, send the init code 0x
  const initCode = code !== "0x" ? "0x" :
    FACTORY_ADDRESS +
    factoryData.slice(2);

  const Account = await hre.ethers.getContractFactory("Account");




  const responce = await ethers.provider.send("eth_estimateUserOperationGas", [
    {
      sender: sender,
      nonce: "0x" + (await ep.getNonce(sender, 1)).toString(16),
      callData: Account.interface.encodeFunctionData("execute"),
      paymaster: PAYMASTER_ADDRESS,
      factory: FACTORY_ADDRESS,
      factoryData: factoryData,
      signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
    },
    ENTRYPOINT_ADDRESS
  ]);

  console.log(responce)

  // Parse the response values (hex strings to BigInt)
  const callGasLimit = BigInt(responce.callGasLimit);
  const verificationGasLimit = BigInt(responce.verificationGasLimit);
  const preVerificationGas = BigInt(responce.preVerificationGas);
  const paymasterVerificationGasLimit = responce.paymasterVerificationGasLimit
    ? BigInt(responce.paymasterVerificationGasLimit)
    : 0n; // fallback if not present
  const paymasterPostOpGasLimit = 250_000n; // or set as needed

  // Helper: pack two uint128 into a bytes32 string
  function packUint128(high, low) {
    const MAX = (1n << 128n) - 1n;
    if (high > MAX || low > MAX) {
      throw new Error("uint128 overflow when packing");
    }
    const packed = (BigInt(high) << 128n) | BigInt(low);
    return toBeHex(packed, 32); // 64-hex-char 0x… string
  }

  // Pack the gas limits
  const accountGasLimits = packUint128(verificationGasLimit, callGasLimit);

 

  // Pack paymasterAndData
  const paymasterAndData = hre.ethers.solidityPacked(
    ["address", "uint128", "uint128"],

    [
      PAYMASTER_ADDRESS,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit,
      // extraData if needed
    ]
  );

 

  const responce2 = await alchemy.core.getFeeData()

  console.log(responce2);

  const response3 = await ethers.provider.send("rundler_maxPriorityFeePerGas");

  console.log(response3);

  // Get gas fees - use higher values to ensure bundler acceptance
  const baseMaxFeePerGas = responce2.maxFeePerGas;
  const baseMaxPriorityFeePerGas = response3;
  
  // Increase the maxFeePerGas to meet bundler requirements (at least 30.000000060 gwei)
  const minRequiredFee = hre.ethers.parseUnits("150.000000060", "gwei"); // Slightly higher than 30 gwei
  const maxFeePerGas = baseMaxFeePerGas > minRequiredFee ? baseMaxFeePerGas : minRequiredFee;
  const maxPriorityFeePerGas = baseMaxPriorityFeePerGas;
  
  console.log("Base maxFeePerGas:", hre.ethers.formatUnits(BigInt(baseMaxFeePerGas), "gwei"), "gwei");
  console.log("Using maxFeePerGas:", hre.ethers.formatUnits(BigInt(maxFeePerGas), "gwei"), "gwei");
  console.log("maxPriorityFeePerGas:", hre.ethers.formatUnits(BigInt(maxPriorityFeePerGas), "gwei"), "gwei");
  
  const gasFees = packUint128(maxPriorityFeePerGas, maxFeePerGas);

   // Now build the userOp with the parsed values
  // const userOp = {
  //   sender: sender,
  //   nonce: "0x" + (await ep.getNonce(sender, 0)).toString(16),
  //   initCode: initCode,
  //   callData: Account.interface.encodeFunctionData("execute"),
  //   accountGasLimits: accountGasLimits,
  //   preVerificationGas: hre.ethers.toBeHex(preVerificationGas),
  //   gasFees: gasFees,
  //   paymasterAndData: paymasterAndData,
  //   signature:"0x"
  // };

  // console.log(userOp);
  //   const userOpHash = await ep.getUserOpHash(userOp);
  //   userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));

  //console.log(userOp);

  // Create UserOperation for EntryPoint hash calculation (packed format)
  const userOpForHash = {
    sender: sender,
    nonce: "0x" + (await ep.getNonce(sender, 1)).toString(16),
    callData: Account.interface.encodeFunctionData("execute"),
    initCode: initCode,
    accountGasLimits: accountGasLimits,
    preVerificationGas: hre.ethers.toBeHex(preVerificationGas),
    gasFees: gasFees,
    paymasterAndData: paymasterAndData,
    signature: "0x" // Will be filled after signing
  }

  // Create UserOperation for the bundler (unpacked format)
  const userOpv7 = {
    sender: sender,
    nonce: "0x" + (await ep.getNonce(sender, 1)).toString(16),
    callData: Account.interface.encodeFunctionData("execute"),
    initCode: initCode,
    callGasLimit: toBeHex(callGasLimit),
    verificationGasLimit: toBeHex(verificationGasLimit),
    maxFeePerGas: toBeHex(BigInt(maxFeePerGas)),
    maxPriorityFeePerGas: toBeHex(BigInt(maxPriorityFeePerGas)),
    paymaster: PAYMASTER_ADDRESS,
    paymasterData: "0x",
    paymasterVerificationGasLimit: toBeHex(paymasterVerificationGasLimit),
    factory: FACTORY_ADDRESS,
    factoryData: factoryData,
    preVerificationGas: hre.ethers.toBeHex(preVerificationGas),
    paymasterPostOpGasLimit: toBeHex(paymasterPostOpGasLimit),
    signature: "0x" // Will be filled after signing
  }

    
    // Get the userOpHash from EntryPoint (using packed format)
    const userOpHash = await ep.getUserOpHash(userOpForHash);
    console.log("UserOpHash:", userOpHash);
    
    // Sign the userOpHash with your private key
    const signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));
    
    // Add signature to both UserOperation objects
    userOpForHash.signature = signature;
    userOpv7.signature = signature;
    
    console.log("Signed UserOperation for bundler:", userOpv7);
    
    // Send the UserOperation to the bundler
    const sendUserOpResponse = await ethers.provider.send("eth_sendUserOperation", [
      userOpv7,
      ENTRYPOINT_ADDRESS
    ]);
    
    console.log("Bundler Response:", sendUserOpResponse);

  // const userOpHash2 = await ethers.provider.send("eth_estimateUserOperationGas", [userOp, ENTRYPOINT_ADDRESS]);

  // console.log(userOpHash2);

  //   const tx = await ep.handleOps([userOp], owner); 
  //   const receipt = await tx.wait();
  //   console.log(receipt);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});