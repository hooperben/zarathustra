.PHONY: test

build:
	forge build --via-ir

test:
	forge test --via-ir -vvvvv --rpc-url "https://wispy-neat-dream.quiknode.pro/a687d0bd8f8b05737cdee54c83f59c29ee8aaa11/"


deploy-holesky:
	forge create --rpc-url https://purple-divine-morning.ethereum-holesky.quiknode.pro/145f60a65b09b33285c3bfc8efda5335394ea282/ --private-key 0x123 "src:Vault"

