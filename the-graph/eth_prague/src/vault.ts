import { GraphDepositTracker as GraphDepositTrackerEvent } from "../generated/Vault/Vault"
import { GraphDepositTracker } from "../generated/schema"

export function handleGraphDepositTracker(
  event: GraphDepositTrackerEvent
): void {
  let entity = new GraphDepositTracker(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
