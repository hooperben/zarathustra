import json
from pathlib import Path

import websockets
from eth_utils import to_checksum_address
from web3 import Web3


def load_vault_abi() -> dict:
    with open(Path(__file__).parent / "Vault.json", "r") as f:
        return json.load(f)["abi"]


optimism_ws = "wss://yolo-responsive-uranium.optimism-sepolia.quiknode.pro/4117a7afcaf13ff979a47fa13d515e124cf1e2b8/"
optimism_http = "https://yolo-responsive-uranium.optimism-sepolia.quiknode.pro/4117a7afcaf13ff979a47fa13d515e124cf1e2b8/"
local_http = "http://127.0.0.1:8545"

holesky_ws = "wss://purple-divine-morning.ethereum-holesky.quiknode.pro/145f60a65b09b33285c3bfc8efda5335394ea282/"
holesky_http = "https://purple-divine-morning.ethereum-holesky.quiknode.pro/145f60a65b09b33285c3bfc8efda5335394ea282/"
holesky_vault = to_checksum_address("0xed4712592F95974fb0346730429C512f20c01348")
optimism_vault = to_checksum_address("0x5e20B22F03E84572424317107a16f7251f870049")
local_vault = to_checksum_address("0x5fbdb2315678afecb367f032d93f642f64180aa3")

web3_op = Web3(Web3.HTTPProvider(optimism_http))
web3_hk = Web3(Web3.HTTPProvider(holesky_http))
web3_local = Web3(Web3.HTTPProvider(local_http))

vault_abi = load_vault_abi()
op_contract = web3_op.eth.contract(address=optimism_vault, abi=vault_abi)
hk_contract = web3_hk.eth.contract(address=holesky_vault, abi=vault_abi)
local_contract = web3_local.eth.contract(address=local_vault, abi=vault_abi)


def get_log_sub_msg(address: str, topics: list):
    if topics:
        return f'{{"jsonrpc":"2.0","id":1,"method":"eth_subscribe","params":["logs",{{"address":"{address}","topics":{topics}}}]}}'
    else:
        return f'{{"jsonrpc":"2.0","id":1,"method":"eth_subscribe","params":["logs",{{"address":"{address}"}}]}}'


async def monitor_optimism():
    async with websockets.connect(optimism_ws) as ws:
        await ws.send(get_log_sub_msg(optimism_vault, []))
        while True:
            response = await ws.recv()
            print(response)


async def monitor_holesky():
    async with websockets.connect(holesky_ws) as ws:
        await ws.send(get_log_sub_msg(holesky_vault, []))
        while True:
            response = await ws.recv()
            print(response)


if __name__ == "__main__":
    print(load_vault_abi())

    print(local_contract.functions.bridgeRequests(0).call())

