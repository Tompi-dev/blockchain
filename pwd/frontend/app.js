import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.4/+esm";

console.log("[INIT] Token dApp loaded");

const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";


const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];


const DECIMALS = 0;


const statusEl = document.getElementById("status");
const accountEl = document.getElementById("account");
const chainEl = document.getElementById("chain");

const balanceEl = document.getElementById("balance");
const toEl = document.getElementById("to");
const amountEl = document.getElementById("amount");

const txhashEl = document.getElementById("txhash");
const eventsEl = document.getElementById("events");
const errorEl = document.getElementById("error");

const btnConnect = document.getElementById("btnConnect");
const btnRefresh = document.getElementById("btnRefresh");
const btnTransfer = document.getElementById("btnTransfer");

let provider = null;
let signer = null;
let userAddress = null;
let tokenRead = null;
let tokenWrite = null;

function log(msg, data) {
  if (data !== undefined) console.log("[dApp]", msg, data);
  else console.log("[dApp]", msg);
}

function showError(err) {
  const msg = err?.reason || err?.shortMessage || err?.message || String(err);
  console.error("[dApp ERROR]", err);
  errorEl.textContent = "Error: " + msg;
}

function clearError() {
  errorEl.textContent = "";
}

function shortAddr(a) {
  if (!a) return "—";
  return a.slice(0, 6) + "..." + a.slice(-4);
}

async function connectWallet() {
  clearError();
  log("Connect clicked");

  if (!window.ethereum) throw new Error("MetaMask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);

  const net = await provider.getNetwork();
  chainEl.textContent = String(net.chainId);

  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  statusEl.textContent = "Connected ✅";
  accountEl.textContent = userAddress;

  tokenRead = new ethers.Contract(TOKEN_ADDRESS, ABI, provider);
  tokenWrite = new ethers.Contract(TOKEN_ADDRESS, ABI, signer);

  log("Connected", { userAddress, chainId: net.chainId, token: TOKEN_ADDRESS });

  await refreshBalance();
  startTransferListener();
}

async function refreshBalance() {
  clearError();
  if (!tokenRead || !userAddress) throw new Error("Connect wallet first");

  log("Reading balanceOf()", userAddress);

  const raw = await tokenRead.balanceOf(userAddress);
  const formatted = ethers.formatUnits(raw, DECIMALS);

  balanceEl.textContent = formatted;
  log("Balance updated", formatted);
}

function startTransferListener() {
  // avoid duplicates
  tokenRead.removeAllListeners("Transfer");

  tokenRead.on("Transfer", async (from, to, value, event) => {
    const pretty = ethers.formatUnits(value, DECIMALS);
    const line = `Transfer event: ${shortAddr(from)} → ${shortAddr(to)} : ${pretty}`;
    eventsEl.textContent = line;

    log("Transfer event", { from, to, pretty, tx: event?.log?.transactionHash });

   
    const me = userAddress.toLowerCase();
    if (from.toLowerCase() === me || to.toLowerCase() === me) {
      await refreshBalance();
    }
  });

  log("Transfer listener started");
}

async function doTransfer() {
  clearError();
  txhashEl.textContent = "—";
  eventsEl.textContent = "";

  if (!tokenWrite || !userAddress) throw new Error("Connect wallet first");

  const to = toEl.value.trim();
  const amountStr = amountEl.value.trim();

  if (!ethers.isAddress(to)) throw new Error("Invalid 'to' address");
  if (!amountStr || Number(amountStr) <= 0) throw new Error("Amount must be > 0");

  const amount = ethers.parseUnits(amountStr, DECIMALS);

  log("Sending transfer()", { to, amountStr });

  try {
    const tx = await tokenWrite.transfer(to, amount);
    txhashEl.textContent = tx.hash;
    log("Tx sent", tx.hash);

    const receipt = await tx.wait();
    log("Tx mined", { status: receipt.status, block: receipt.blockNumber });

    await refreshBalance();
  } catch (e) {
    if (e?.code === 4001) throw new Error("User rejected transaction (MetaMask Reject)");
    throw e;
  }
}


btnConnect.onclick = () => connectWallet().catch(showError);
btnRefresh.onclick = () => refreshBalance().catch(showError);
btnTransfer.onclick = () => doTransfer().catch(showError);


if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => location.reload());
  window.ethereum.on("chainChanged", () => location.reload());
}
