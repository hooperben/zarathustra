const endpoint =
  "https://api.studio.thegraph.com/query/77104/eth_prague/v1.0.0";

const query = `
  query GraphDepositTrackers($id: String!) {
    graphDepositTrackers(
      where: {
        id: $id
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
`;

const fetchGraphDepositTrackers = async (id: string) => {
  const variables = {
    id: id,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Network response was not ok: ${errorText}`);
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
};

const main = async () => {
  await fetchGraphDepositTrackers(
    "0x61718a55b8949a38bfdb0e0a7c52b79be566f1f27ccba1870c423cadb6afb01608000000"
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
