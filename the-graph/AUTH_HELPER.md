export STREAMINGFAST_KEY=server_YOUR_KEY_HERE
function sftoken {
export SUBSTREAMS_API_TOKEN=$(curl https://auth.streamingfast.io/v1/auth/issue -s --data-binary '{"api_key":"'$STREAMINGFAST_KEY'"}' | jq -r .token)
echo "Token set on in SUBSTREAMS_API_TOKEN"
}s
