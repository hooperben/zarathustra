import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { GraphDepositTracker } from "../generated/Vault/Vault"

export function createGraphDepositTrackerEvent(
  user: Address,
  amount: BigInt
): GraphDepositTracker {
  let graphDepositTrackerEvent = changetype<GraphDepositTracker>(newMockEvent())

  graphDepositTrackerEvent.parameters = new Array()

  graphDepositTrackerEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  graphDepositTrackerEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return graphDepositTrackerEvent
}
