import { useAccount } from "wagmi"

export default function Wallets() {
  const { address } = useAccount()

  return (
    <div>
      <div className="stitch-node-glass rounded-none p-4 md:p-6">
        <h3 className="text-on-surface text-body-sm font-semibold mb-3">Connected Wallet</h3>
        <p className="font-mono text-on-surface-variant text-body-sm break-all">{address}</p>
      </div>
      <div className="stitch-node-glass rounded-none p-6 mt-4 text-center text-text-subtle text-body-sm">
        Multi-wallet support coming soon for Elite plan.
      </div>
    </div>
  )
}
