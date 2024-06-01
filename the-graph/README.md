### Zarathustra (Eigen Bridge)

We currently use a graph sub graph in order to index events emitted from our vault contract.

Example txId = 0x61718a55b8949a38bfdb0e0a7c52b79be566f1f27ccba1870c423cadb6afb01608000000

With query:

```
query GraphDepositTrackers {
    graphDepositTrackers(
        where: {
            id: ""
        }
    ) {
        id
        user
        amount
        blockNumber
        blockTimestamp
        transactionHash
    }
}

```

with inputs:

```
{
	"id": "0x61718a55b8949a38bfdb0e0a7c52b79be566f1f27ccba1870c423cadb6afb01608000000"
}
```

or if you just run:

```
query GraphDepositTrackers {
    graphDepositTrackers(
        where: {
            id: "0x61718a55b8949a38bfdb0e0a7c52b79be566f1f27ccba1870c423cadb6afb01608000000"
        }
    ) {
        id
        user
        amount
        blockNumber
        blockTimestamp
        transactionHash
    }
}
```

at:

https://api.studio.thegraph.com/proxy/77104/eth_prague/v1.0.0/graphql
