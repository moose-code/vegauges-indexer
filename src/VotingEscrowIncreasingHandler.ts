import { Context } from "vm";
import {
  VotingEscrowIncreasing,
  Deposit,
  MinDepositSet,
  Withdraw,
} from "generated";
import {
  updateWithdrawalDailyMetrics,
  updateDepositDailyMetrics,
  addUniqueStaker,
  updateEscrowDailyMetrics,
  setContractData,
  updateEscrowLocksMetrics,
} from "./helpers";
import { EOF } from "dns";

VotingEscrowIncreasing.Initialized.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);
});

VotingEscrowIncreasing.Deposit.handler(async ({ event, context }) => {
  const entity: Deposit = {
    id: `${event.params.tokenId}_${event.srcAddress}_${event.chainId}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    startTs: event.params.startTs,
    value: event.params.value,
    newTotalLocked: event.params.newTotalLocked,
    active: true,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.Deposit.set(entity);

  await addUniqueStaker(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    context,
  );
  await updateDepositDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.value,
    Number(event.params.startTs),
    context,
  );
  await updateEscrowDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.newTotalLocked,
    Number(event.params.startTs),
    true,
    context,
  );

  await updateEscrowLocksMetrics(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.newTotalLocked,
    Number(event.params.startTs),
    true,
    context,
  );
});

VotingEscrowIncreasing.MinDepositSet.handler(async ({ event, context }) => {
  const entity: MinDepositSet = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    minDeposit: event.params.minDeposit,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.MinDepositSet.set(entity);
});

VotingEscrowIncreasing.Withdraw.handler(async ({ event, context }) => {
  const entity: Withdraw = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    value: event.params.value,
    ts: event.params.ts,
    newTotalLocked: event.params.newTotalLocked,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.Withdraw.set(entity);

  await setLockActiveStatusToInactive(
    event.chainId,
    event.srcAddress,
    event.params.tokenId,
    context,
  );

  await updateWithdrawalDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.value,
    Number(event.params.ts),
    context,
  );
  await updateEscrowDailyMetrics(
    event.chainId,
    event.srcAddress,
    event.params.newTotalLocked,
    Number(event.params.ts),
    false,
    context,
  );

  await updateEscrowLocksMetrics(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
    event.params.newTotalLocked,
    Number(event.params.ts),
    false,
    context,
  );
});

// Function to set Lock active status as false
async function setLockActiveStatusToInactive(
  chainId: number,
  srcAddress: string,
  tokenId: BigInt,
  context: Context,
) {
  const depositId = `${tokenId}_${srcAddress}_${chainId}`;
  const deposit = await context.Deposit.get(depositId);
  const entity: Deposit = {
    id: depositId,
    depositor: deposit.depositor,
    tokenId: deposit.tokenId,
    startTs: deposit.startTs,
    value: deposit.value,
    newTotalLocked: deposit.newTotalLocked,
    active: false,
    contract_id: deposit.contract_id,
  };

  context.Deposit.set(entity);
}
