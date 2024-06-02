.PHONY: test

build:
	forge build --via-ir

test:
	forge test --via-ir -vvvvv --rpc-url "https://wispy-neat-dream.quiknode.pro/a687d0bd8f8b05737cdee54c83f59c29ee8aaa11/"


deploy:
	forge create --rpc-url "127.0.0.1:8545" --private-key "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" "Vault"

