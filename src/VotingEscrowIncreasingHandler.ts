import {
  VotingEscrowIncreasing,
  VotingEscrowIncreasing_AdminChanged,
  VotingEscrowIncreasing_BeaconUpgraded,
  VotingEscrowIncreasing_Deposit,
  VotingEscrowIncreasing_Initialized,
  VotingEscrowIncreasing_MinDepositSet,
  VotingEscrowIncreasing_Paused,
  VotingEscrowIncreasing_Sweep,
  VotingEscrowIncreasing_SweepNFT,
  VotingEscrowIncreasing_Unpaused,
  VotingEscrowIncreasing_Upgraded,
  VotingEscrowIncreasing_Withdraw,
} from "generated";
import {
  setContractData,
  updateLocksDayData,
  updateWithdrawalLocksDayData,
  updateDepositLocksDayData,
  addUniqueStaker,
} from "./helpers";

VotingEscrowIncreasing.AdminChanged.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: VotingEscrowIncreasing_AdminChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousAdmin: event.params.previousAdmin,
    newAdmin: event.params.newAdmin,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_AdminChanged.set(entity);
});

VotingEscrowIncreasing.BeaconUpgraded.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: VotingEscrowIncreasing_BeaconUpgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    beacon: event.params.beacon,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_BeaconUpgraded.set(entity);
});

VotingEscrowIncreasing.Deposit.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Deposit = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    startTs: event.params.startTs,
    value: event.params.value,
    newTotalLocked: event.params.newTotalLocked,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Deposit.set(entity);

  await updateDepositLocksDayData(
    event.chainId,
    event.srcAddress,
    event.params.value,
    Number(event.params.startTs),
    context,
  );
  await updateLocksDayData(
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

VotingEscrowIncreasing.Initialized.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: VotingEscrowIncreasing_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Initialized.set(entity);
});

VotingEscrowIncreasing.MinDepositSet.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_MinDepositSet = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    minDeposit: event.params.minDeposit,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_MinDepositSet.set(entity);
});

VotingEscrowIncreasing.Paused.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Paused.set(entity);
});

VotingEscrowIncreasing.Sweep.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Sweep = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    to: event.params.to,
    amount: event.params.amount,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Sweep.set(entity);
});

VotingEscrowIncreasing.SweepNFT.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_SweepNFT = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    to: event.params.to,
    tokenId: event.params.tokenId,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_SweepNFT.set(entity);
});

VotingEscrowIncreasing.Unpaused.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: VotingEscrowIncreasing_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Unpaused.set(entity);
});

VotingEscrowIncreasing.Upgraded.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    implementation: event.params.implementation,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Upgraded.set(entity);
});

VotingEscrowIncreasing.Withdraw.handler(async ({ event, context }) => {
  const entity: VotingEscrowIncreasing_Withdraw = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    depositor: event.params.depositor,
    tokenId: event.params.tokenId,
    value: event.params.value,
    ts: event.params.ts,
    newTotalLocked: event.params.newTotalLocked,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VotingEscrowIncreasing_Withdraw.set(entity);

  await updateWithdrawalLocksDayData(
    event.chainId,
    event.srcAddress,
    event.params.value,
    Number(event.params.ts),
    context,
  );
  await updateLocksDayData(
    event.chainId,
    event.srcAddress,
    event.params.newTotalLocked,
    Number(event.params.ts),
    false,
    context,
  );
});
