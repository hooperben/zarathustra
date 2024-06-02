import asyncio
import json
from pathlib import Path

import eth_abi
import websockets
from eth_account import Account
from eth_account.signers.local import LocalAccount
from eth_typing import ChecksumAddress
from eth_utils import to_checksum_address
from web3 import Web3

from py.erc_20 import approve_token


def load_vault_abi() -> dict:
    with open(Path(__file__).parent / "Vault.json", "r") as f:
        return json.load(f)["abi"]


optimism_ws = "wss://yolo-responsive-uranium.optimism-sepolia.quiknode.pro/4117a7afcaf13ff979a47fa13d515e124cf1e2b8/"
optimism_http = "https://optimism-sepolia.infura.io/v3/2bc37d20ac5048fa848978190f5f24bc"
local_http = "http://127.0.0.1:8545"

holesky_ws = "wss://purple-divine-morning.ethereum-holesky.quiknode.pro/145f60a65b09b33285c3bfc8efda5335394ea282/"
holesky_http = "https://purple-divine-morning.ethereum-holesky.quiknode.pro/145f60a65b09b33285c3bfc8efda5335394ea282/"
holesky_vault = to_checksum_address("0xE79285994020f0C8177E795430BF69A7C193FaD3")
optimism_vault = to_checksum_address("0x38a406C320Ab23f18D3a10E44f37084d29f4dD96")
local_vault = to_checksum_address("0x5fbdb2315678afecb367f032d93f642f64180aa3")
avs = to_checksum_address("0x53bce04C488e3da5295b9C1118a057b52cB18e57")

web3_op = Web3(Web3.HTTPProvider(optimism_http))
web3_hk = Web3(Web3.HTTPProvider(holesky_http))
web3_local = Web3(Web3.HTTPProvider(local_http))

vault_abi = load_vault_abi()
op_contract = web3_op.eth.contract(address=optimism_vault, abi=vault_abi)
hk_contract = web3_hk.eth.contract(address=holesky_vault, abi=vault_abi)
local_contract = web3_local.eth.contract(address=local_vault, abi=vault_abi)

burner_pkey = "7ece18011d2ce43ad48fabab34ec165fc7fdecfa92daf0d91e235fed94e5505f"
burner_address = to_checksum_address("0x485B7B8ECA681221d68250a7Ed88b1d4c9152149")

deployer_pkey = "861210e14ede5ffc63a502be024c8b4ee34c23744a411b38858f12c78723a1a2"

test_erc20_addr = to_checksum_address("0x7c127124Fa31D6B321E3a0Fd81F8612Eb1eD7090")


def get_log_sub_msg(address: str, topics: list):
    if topics:
        return f'{{"jsonrpc":"2.0","id":1,"method":"eth_subscribe","params":["logs",{{"address":"{address}","topics":{topics}}}]}}'
    else:
        return f'{{"jsonrpc":"2.0","id":1,"method":"eth_subscribe","params":["logs",{{"address":"{address}"}}]}}'


def add_whitelist_to_vault(web3: Web3, vault: ChecksumAddress, whitelist_address: ChecksumAddress, deployer: LocalAccount):
    contract = web3.eth.contract(address=vault, abi=vault_abi)
    account = deployer.address

    tx = contract.functions.whitelistSigner(whitelist_address).build_transaction({
        'from': account,
        'nonce': web3.eth.get_transaction_count(account),
        'gas': 2000000,
        'gasPrice': web3.to_wei('20', 'gwei')
    })

    signed_tx = web3.eth.account.sign_transaction(tx, deployer.key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return tx_hash.hex()


def set_bridge_fee(web3: Web3, vault: ChecksumAddress, deployer: LocalAccount):
    contract = web3.eth.contract(address=vault, abi=vault_abi)
    account = deployer.address

    tx = contract.functions.setBridgeFee(0).build_transaction({
        'from': account,
        'nonce': web3.eth.get_transaction_count(account),
        'gas': 2000000,
        'gasPrice': web3.to_wei('20', 'gwei')
    })

    signed_tx = web3.eth.account.sign_transaction(tx, deployer.key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return tx_hash.hex()


def bridge(token: ChecksumAddress, amount: int, source_vault: ChecksumAddress, source_web3: Web3, destination_vault: ChecksumAddress, destination_address: ChecksumAddress, for_account: LocalAccount) -> str:
    contract = source_web3.eth.contract(address=source_vault, abi=vault_abi)
    account = for_account.address

    tx = contract.functions.bridge(token, amount, amount, destination_vault, destination_address, canonicalAttestation=b"").build_transaction({
        'from': account,
        'nonce': source_web3.eth.get_transaction_count(account),
        'gas': 2000000,
        'gasPrice': source_web3.to_wei('20', 'gwei'),
    })

    signed_tx = source_web3.eth.account.sign_transaction(tx, for_account.key)
    tx_hash = source_web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return tx_hash.hex()


async def monitor_optimism():
    async with websockets.connect(optimism_ws) as ws:
        await ws.send(get_log_sub_msg(optimism_vault, []))
        while True:
            response = await ws.recv()
            print(response)


async def release_optimism(
        user: str,
        token_address: ChecksumAddress,
        amount_in: int,
        amount_out: int,
        destination_vault: ChecksumAddress,
        destination_address: ChecksumAddress,
        transfer_index: int,
        canon_sig: str,
        avs_sig: str
):
    bridge_request_data = {
        "user": user,
        "tokenAddress": token_address,
        "amountIn": amount_in,
        "amountOut": amount_out,
        "destinationVault": destination_vault,
        "destinationAddress": destination_address,
        "transferIndex": transfer_index,
        "canonicalAttestation": canon_sig,
    }

    print(f"Releasing funds with {bridge_request_data=}")

    contract = web3_op.eth.contract(address=optimism_vault, abi=vault_abi)
    account = Account.from_key(deployer_pkey)

    tx = contract.functions.releaseFunds(canon_sig, avs_sig, bridge_request_data).build_transaction({
        'from': account.address,
        'nonce': web3_op.eth.get_transaction_count(account.address),
        'gas': 2000000,
        'gasPrice': web3_op.to_wei('20', 'gwei')
    })

    print(f"Built transaction {tx=}")
    signed_tx = web3_op.eth.account.sign_transaction(tx, account.key)
    print(f"Signed transaction {signed_tx=}")
    tx_hash = web3_op.eth.send_raw_transaction(signed_tx.rawTransaction)
    print(f"Sent transaction {tx_hash=}")

    return tx_hash.hex()


def decode_bridge_event(data: str):
    print(f"Decoding {data=}")
    v = eth_abi.decode(
        ['uint256', 'uint256', 'address', 'address', 'uint256', 'bytes'],
        bytes.fromhex(data[2:])
    )
    print(f"Decoded {v=}")
    return v


def decode_address(data: str) -> ChecksumAddress:
    return to_checksum_address(eth_abi.decode(
        ['address'],
        bytes.fromhex(data[2:])
    )[0])


async def monitor_holesky():
    pending_avs_attestations = {}
    async with websockets.connect(holesky_ws) as ws:
        await ws.send(get_log_sub_msg(holesky_vault, []))
        await ws.recv()
        while True:
            response = json.loads(await ws.recv())
            print(response)
            result = response["params"]["result"]
            if result["topics"][0] == "0x8ed7e4b72075b17af0eebc2b80fcd8063064321a9a579f84a12ce0cb998b35d7":
                pending_avs_attestations[int(result["topics"][3], 16)] = result
                print("Added to pending attestations:", pending_avs_attestations)

            if result["topics"][0] == "0xeb025381a670ddf36d45dab7eecb37e2ed3eca65cb3f70b4a921939a79d4bec5":
                attestation_id = int(result["topics"][2], 16)
                print(f"AVS attestation received for {attestation_id}")
                canonical_request = pending_avs_attestations[attestation_id]
                decoded_original = decode_bridge_event(pending_avs_attestations[attestation_id]["data"])

                await release_optimism(
                        user=decode_address(canonical_request["topics"][1]),
                        token_address=decode_address(canonical_request["topics"][2]),
                        amount_in=decoded_original[0],
                        amount_out=decoded_original[1],
                        destination_vault=to_checksum_address(decoded_original[2]),
                        destination_address=to_checksum_address(decoded_original[3]),
                        transfer_index=decoded_original[4],
                        canon_sig=decoded_original[5],
                        avs_sig=result["topics"][1]
                    )

if __name__ == "__main__":
    print(load_vault_abi())

    # print(local_contract.functions.bridgeRequests(0).call())

    # print(approve_token(web3_hk, test_erc20_addr, holesky_vault, 10**18, Account.from_key(burner_pkey)))
    # print(add_whitelist_to_vault(web3_hk, holesky_vault, avs, Account.from_key(deployer_pkey)))
    # print(add_whitelist_to_vault(web3_op, optimism_vault, avs, Account.from_key(deployer_pkey)))
    # print(set_bridge_fee(web3_hk, holesky_vault, Account.from_key(deployer_pkey)))
    # print(bridge(test_erc20_addr, 1, holesky_vault, web3_hk, optimism_vault, burner_address, Account.from_key(burner_pkey)))
    asyncio.run(monitor_holesky())

