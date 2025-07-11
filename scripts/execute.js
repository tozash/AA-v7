const hre = require("hardhat");
require("dotenv").config();

const { hexlify, zeroPadValue, toBeHex } = require("ethers");

const ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const FACTORY_ADDRESS = "0x0cbd34dfb5CC74195C07958c3E167620a6f0B0C9";
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

  // if the account already exists, send the init code 0x
  const initCode = code !== "0x" ? "0x" :
    FACTORY_ADDRESS +
    factory.interface
      .encodeFunctionData("createAccount", [owner, SALT])
      .slice(2);

  const Account = await hre.ethers.getContractFactory("Account");

  


const paymasterAndData = hre.ethers.solidityPacked(
  ["address","uint128","uint128"],
  [
    PAYMASTER_ADDRESS,
    0,
    0,
    //extraData               // or "0x"
  ]
);

  const userOp = {
    sender: sender,
    nonce: "0x" + (await ep.getNonce(sender, 0)).toString(16),
    initCode: 
    initCode,
    callData: Account.interface.encodeFunctionData("execute"),
    // ✅ gas limits
    //accountGasLimits: accountGasLimits,
    //preVerificationGas: hre.ethers.toBeHex(50_000),         // 0xC350
    // ✅ gas fees
    //gasFees: gasFees,
    paymasterAndData: paymasterAndData, // if no paymaster, keep it "0x"
    signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"         // fill with real sig when signing
  };


  const responce = await ethers.provider.send("eth_estimateUserOperationGas", [
    userOp,
    ENTRYPOINT_ADDRESS
  ]);

  console.log(responce)


// // ------------ your numbers ------------
// const callGasLimit          = 200_000n;
// const verificationGasLimit  = 800_000n;

// const maxFeePerGas          = hre.ethers.parseUnits("10", "gwei");   // bigint
// const maxPriorityFeePerGas  = hre.ethers.parseUnits("5",  "gwei");

// // ------------ pack them ---------------
// // helper: pack two uint128 into a bytes32 string
// function packUint128(high, low) {
//     const MAX = (1n << 128n) - 1n;
//     if (high > MAX || low > MAX) {
//       throw new Error("uint128 overflow when packing");
//     }
//     const packed = (BigInt(high) << 128n) | BigInt(low);
//     return toBeHex(packed, 32);                   // 64-hex-char 0x… string
//   }

// const accountGasLimits = packUint128(
//     verificationGasLimit,
//     callGasLimit
//   );
  
//   const gasFees = packUint128(
//     maxPriorityFeePerGas,
//     maxFeePerGas
//   );


// const paymasterVerificationGasLimit = 120_000n;   // gas for validatePaymasterUserOp
// const paymasterPostOpGasLimit       = 250_000n;   // gas for postOp

//   const userOpHash = await ep.getUserOpHash(userOp);
//   userOp.signature = signer0.signMessage(hre.ethers.getBytes(userOpHash));

//   const tx = await ep.handleOps([userOp], owner);
//   const receipt = await tx.wait();
//   console.log(receipt);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});