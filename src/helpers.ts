import { Context } from "vm";

export const setContractData = async (chainId: Number, srcAddress: String, context: Context) => {
  let contract_id = await context.ContractData.get(`${chainId}_${srcAddress}`);

  if (!contract_id) {
    context.ContractData.set({
      id: `${chainId}_${srcAddress}`,
      address: srcAddress,
      chainId: chainId
    })
  }
}

export function getDayID(timestamp: number) {
  return Math.floor(timestamp / 86400); // rounded
}

export function getDayStartTimestamp(dayID: number) {
  return dayID * 86400;
}

export const updateDepositLocksDayData = async (chainId: Number, srcAddress: String, lockedAmount: BigInt, timestamp: number, context: Context) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData = await context.VotingEscrowIncreasing_AggregatedDepositDayData.get(aggregatedDataID);

  if (!locksData) {
    context.VotingEscrowIncreasing_AggregatedDepositDayData.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}_${srcAddress}`,
      totalLocked: lockedAmount,
      amountOfLocks: 1,
    });
  } else {
    context.VotingEscrowIncreasing_AggregatedDepositDayData.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}_${srcAddress}`,
      totalLocked: locksData.totalLocked + lockedAmount,
      amountOfLocks: locksData.amountOfLocks++,
    });
  }
}
export const updateWithdrawalLocksDayData = async (chainId: Number, srcAddress: String, value: BigInt, timestamp: number, context: Context) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData = await context.VotingEscrowIncreasing_AggregatedWithdrawDayData.get(aggregatedDataID);

  if (!locksData) {
    context.VotingEscrowIncreasing_AggregatedWithdrawDayData.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}_${srcAddress}`,
      totalWithdraw: value,
      amountOfWithdrawals: BigInt(1),
    });
  } else {
    context.VotingEscrowIncreasing_AggregatedWithdrawDayData.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}_${srcAddress}`,
      totalWithdraw: locksData.totalWithdraw + value,
      amountOfWithdrawals: locksData.amountOfWithdrawals++,
    });
  }
}

export const updateLocksDayData = async (chainId: Number, srcAddress: String, totalLocked: BigInt, timestamp: number, isLocking: boolean, context: Context) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData = await context.VotingEscrowIncreasing_AggregatedDayData.get(aggregatedDataID);

  if (!locksData) {
    context.VotingEscrowIncreasing_AggregatedDayData.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}_${srcAddress}`,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? BigInt(1) : BigInt(0),
    });
  } else {
    context.VotingEscrowIncreasing_AggregatedDayData.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}_${srcAddress}`,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? locksData.amountOfLocks++ : locksData.amountOfLocks--,
    });
  }
}

