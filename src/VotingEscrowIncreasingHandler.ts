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
} from "./helpers";

VotingEscrowIncreasing.Initialized.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);
});

VotingEscrowIncreasing.Deposit.handler(async ({ event, context }) => {
  if (event.params.tokenId === BigInt(304)) {
    console.log("Token ID is 304");
    console.log(`Exit Queue is: ${event.srcAddress}`);
    console.log(`Chain id: ${event.chainId}`);
  }
  const entity: Deposit = {
    id: `${event.params.tokenId}_${event.srcAddress}_${event.chainId}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    startTs: event.params.startTs,
    value: event.params.value,
    newTotalLocked: event.params.newTotalLocked,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.Deposit.set(entity);

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

  await addUniqueStaker(
    event.chainId,
    event.srcAddress,
    event.params.depositor,
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
});
