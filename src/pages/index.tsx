import { ContractCallRegularOptions, openContractCall } from "@stacks/connect";
import { AnchorMode, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import { appDetails, contractOwnerAddress } from "../lib/constants";
import { useStacks } from "../providers/StacksProvider";

export default function Home() {
  const { network, address } = useStacks();
  const [transactionId, setTransactionId] = useState<string | undefined>(undefined)
  const [transactionJson, setTransactionJson] = useState<any>(undefined)

  async function fetchTransactionJson() {
    if (!transactionId) return;

    const apiUrl = network.coreApiUrl
    const url = `${apiUrl}/extended/v1/tx/${transactionId}`
    const res = await fetch(url)
    const json = await res.json()
    setTransactionJson(json)
  }

  useEffect(() => {
    fetchTransactionJson()
  }, [transactionId])

  const mintTokens = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // (contract-call? .magic-beans mint u1000000 tx-sender)
    const options: ContractCallRegularOptions = {
      contractAddress: contractOwnerAddress,
      contractName: 'magic-beans',
      functionName: 'mint',
      functionArgs: [
        uintCV(100_000),
        standardPrincipalCV(address),
      ],
      network,
      appDetails,
      anchorMode: AnchorMode.OffChainOnly,
      onFinish: ({ txId }) => {
        setTransactionId(txId)
      },
    }

    await openContractCall(options)
  }

  return (
    <main className="container flex flex-col items-center justify-center min-h-screen gap-16 p-4 mx-auto">
      <Auth />

      <button type="button" disabled={!address} className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={mintTokens}>Mint Tokens</button>

      <p>
        {transactionId ? `Transaction ID: ${transactionId}` : 'No transaction ID yet'}
      </p>

      <pre className="whitespace-pre">
        {transactionJson ? JSON.stringify(transactionJson, null, 2) : 'No transaction JSON yet'}
      </pre>
    </main>
  )
}
