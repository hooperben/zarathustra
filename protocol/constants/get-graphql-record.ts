const endpoint =
  "https://api.studio.thegraph.com/query/77104/eth_prague/v1.0.0";

const query = `
  query GraphDepositTrackers($id: String!) {
    graphDepositTrackers(
      where: {
        transactionHash: $id
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

export const getGraphQLRecord = async (id: string) => {
  const variables = {
    id: id, // although here its called id, it is actually the tx hash
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
  return data;
};
