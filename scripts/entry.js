require("dotenv").config();

async function main() {

  // Bundler RPC: returns an array of entry-point addresses
  const entryPoints = await ethers.provider.send("eth_supportedEntryPoints", []);

  console.log("Supported EntryPoints:", entryPoints);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});