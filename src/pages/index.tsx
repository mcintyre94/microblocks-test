import { ContractCallRegularOptions, openContractCall } from "@stacks/connect";
import { AnchorMode, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import { appDetails, contractOwnerAddress } from "../lib/constants";
import { useStacks } from "../providers/StacksProvider";
import { Switch } from '@headlessui/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  const { network, address } = useStacks();
  const [useMicrostacks, setUseMicrostacks] = useState(true);
  const [transactionOptions, setTransactionOptions] = useState<ContractCallRegularOptions | undefined>(undefined);
  const [transactionId, setTransactionId] = useState<string | undefined>(undefined)
  const [transactionJson, setTransactionJson] = useState<any>(undefined)

  const anchorMode: AnchorMode = useMicrostacks ? AnchorMode.OffChainOnly : AnchorMode.OnChainOnly

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

  useEffect(() => {
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };
  }, [])

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
      anchorMode,
      onFinish: ({ txId }) => {
        setTransactionId(txId)
      },
    }

    setTransactionOptions(options)

    await openContractCall(options)
  }

  return (
    <main className="container flex flex-col items-center justify-center min-h-screen gap-16 p-4 mx-auto">
      <Auth />

      <Switch.Group as="div" className="flex items-center">
        <Switch
          checked={useMicrostacks}
          onChange={setUseMicrostacks}
          className={classNames(
            useMicrostacks ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              useMicrostacks ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
            )}
          />
        </Switch>
        <Switch.Label as="span" className="flex flex-col ml-3">
          <span className="text-sm font-medium text-gray-900">Use Microblocks</span>
          <span className="text-sm text-gray-500">Anchor mode: {anchorMode}</span>
        </Switch.Label>
      </Switch.Group>

      <button type="button" disabled={!address} className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={mintTokens}>Mint Tokens</button>

      <p>
        {transactionId ? `Transaction ID: ${transactionId}` : 'No transaction ID yet'}
      </p>

      <pre className="whitespace-pre">
        {transactionOptions ? JSON.stringify(transactionOptions, null, 2) : 'No transaction options yet'}
      </pre>

      <pre className="whitespace-pre">
        {transactionJson ? JSON.stringify(transactionJson, null, 2) : 'No transaction JSON yet'}
      </pre>
    </main>
  )
}
