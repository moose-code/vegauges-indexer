import { Context } from "vm";

export const setContractData = async (
  chainId: Number,
  srcAddress: String,
  context: Context,
) => {
  let contract_id = await context.Contract.get(`${chainId}-${srcAddress}`);

  if (!contract_id) {
    context.Contract.set({
      id: `${chainId}-${srcAddress}`,
      address: srcAddress,
      chainId: chainId,
    });
  }
};

export const addUniqueStaker = async (
  chainId: Number,
  srcAddress: String,
  staker: String,
  tokenId: BigInt,
  context: Context,
) => {
  let stakerKey = `${srcAddress}-${staker}-${chainId}`;
  let stakerData = await context.StakerRegistry.get(stakerKey);

  if (!stakerData) {
    await context.StakerRegistry.set({
      id: stakerKey,
      address: staker,
      votingEscrow_id: `${chainId}-${srcAddress}`,
      tokenIds: [tokenId],
    });
  } else {
    await context.StakerRegistry.set({
      id: stakerKey,
      address: staker,
      votingEscrow_id: `${chainId}-${srcAddress}`,
      tokenIds: [...stakerData.tokenIds, tokenId],
    });
  }
};

export const addUniqueVoter = async (
  chainId: Number,
  srcAddress: String,
  voter: String,
  context: Context,
) => {
  const voterKey = `${srcAddress}-${voter}-${chainId}`;

  let voterData = await context.VoterRegistry.get(voterKey);

  if (!voterData) {
    context.VoterRegistry.set({
      id: voterKey,
      address: voter,
      gaugeVoter_id: `${chainId}-${srcAddress}`,
    });
  }
};

export function getDayID(timestamp: number) {
  return Math.floor(timestamp / 86400); // rounded
}

export function getDayStartTimestamp(dayID: number) {
  return dayID * 86400;
}

export const updateDepositDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  lockedAmount: BigInt,
  timestamp: number,
  context: Context,
) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData = await context.EscrowDepositDailyMetrics.get(aggregatedDataID);

  if (!locksData) {
    context.EscrowDepositDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalLocked: lockedAmount,
      amountOfLocks: BigInt(1),
    });
  } else {
    context.EscrowDepositDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalLocked: locksData.totalLocked + lockedAmount,
      amountOfLocks: locksData.amountOfLocks + BigInt(1),
    });
  }
};
export const updateWithdrawalDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  value: BigInt,
  timestamp: number,
  context: Context,
) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData =
    await context.EscrowWithdrawDailyMetrics.get(aggregatedDataID);

  if (!locksData) {
    context.EscrowWithdrawDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalWithdraw: value,
      amountOfWithdrawals: BigInt(1),
    });
  } else {
    context.EscrowWithdrawDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalWithdraw: locksData.totalWithdraw + value,
      amountOfWithdrawals: locksData.amountOfWithdrawals + BigInt(1),
    });
  }
};

export const updateEscrowDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  totalLocked: BigInt,
  timestamp: number,
  isLocking: boolean,
  context: Context,
) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData = await context.EscrowDailyMetrics.get(aggregatedDataID);

  if (!locksData) {
    context.EscrowDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? BigInt(1) : BigInt(0),
    });
  } else {
    context.EscrowDailyMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalLocked: totalLocked,
      amountOfLocks: isLocking
        ? locksData.amountOfLocks + BigInt(1)
        : locksData.amountOfLocks - BigInt(1),
    });
  }
};

export const updateEscrowLocksMetrics = async (
  chainId: Number,
  srcAddress: String,
  staker: String,
  totalLocked: BigInt,
  timestamp: number,
  isLocking: boolean,
  tokenId: BigInt,
  context: Context,
) => {
  const dayID = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${srcAddress}-${dayID}-${chainId}`;

  let locksData = await context.EscrowLocksMetrics.get(aggregatedDataID);

  const stakerKey = `${srcAddress}-${staker}-${chainId}`;
  let stakerRecord = await context.StakerRegistry.get(stakerKey); // Assume VoterRegistry exists

  const amountActiveLocks = await stakerRecord.tokenIds.reduce(
    async (acc: number, tokenId: BigInt) => {
      const lock = await context.Deposit.get(
        `${tokenId}_${srcAddress}_${chainId}`,
      );
      if (lock.active) {
        acc += 1;
      }
    },
    0,
  );

  const isNewHolder =
    isLocking && stakerRecord.tokenIds.length === 1 ? true : false;

  let activeHolder = 0;

  // If isNewHolder --> +1
  // If Depositing
  // --> If amountActiveLocks === 1 --> +1
  // --> Else --> +0
  // If Withdrawing
  // --> If amountActiveLocks > 0 --> 0
  // --> Esle --> -1
  if (isNewHolder) activeHolder += 1;
  else {
    if (isLocking) {
      if (amountActiveLocks === 1) activeHolder = 1;
      else activeHolder = 0;
    } else {
      if (amountActiveLocks > 0) activeHolder = 0;
      else activeHolder = -1;
    }
  }

  if (!locksData) {
    context.EscrowLocksMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalLocked: totalLocked,
      amountOfLocks: isLocking ? BigInt(1) : BigInt(0),
      totalHolders: isNewHolder ? BigInt(1) : BigInt(0),
      activeHolders: isNewHolder ? BigInt(1) : BigInt(0),
    });
  } else {
    context.EscrowLocksMetrics.set({
      id: aggregatedDataID,
      date: dayStartTimestamp,
      contract_id: `${chainId}-${srcAddress}`,
      totalLocked: totalLocked,
      amountOfLocks: isLocking
        ? locksData.amountOfLocks + BigInt(1)
        : locksData.amountOfLocks - BigInt(1),
      totalHolders: isNewHolder
        ? locksData.totalHolders + BigInt(1)
        : locksData.totalHolders,
      activeHolders: locksData.activeHolders + BigInt(activeHolder),
    });
  }
};

export const updateVotingMetrics = async (
  chainId: Number,
  srcAddress: String,
  gauge: String,
  voter: String,
  votingPower: BigInt,
  timestamp: number,
  isNewVote: boolean, // true for new votes, false for resets
  context: Context,
) => {
  const dayId = getDayID(timestamp);
  const dayStartTimestamp = getDayStartTimestamp(dayId);

  // Update gauge daily metrics
  await updateGaugeDailyMetrics(
    chainId,
    srcAddress,
    gauge,
    voter,
    votingPower,
    dayId,
    dayStartTimestamp,
    isNewVote,
    context,
  );

  // Update contract-wide daily metrics
  await updateGaugePluginDailyMetrics(
    chainId,
    srcAddress,
    votingPower,
    dayId,
    dayStartTimestamp,
    isNewVote,
    context,
  );

  // Update all-time metrics
  await updateAllTimeMetrics(
    chainId,
    srcAddress,
    voter,
    votingPower,
    timestamp,
    isNewVote,
    context,
  );
};

// Helper to update metrics for a specific gauge for a specific day
const updateGaugeDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  gauge: String,
  voter: String,
  votingPower: BigInt,
  dayId: number,
  dayTimestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const gaugeMetricsId = `${gauge}-${dayId}-${chainId}`;
  const contractMetricsId = `${srcAddress}-${dayId}-${chainId}`;
  const contractId = `${chainId}-${srcAddress}`;

  let gaugeMetrics = await context.GaugeDailyVotingMetrics.get(gaugeMetricsId);

  // Track if this voter has already voted for this gauge today
  // In a real implementation, you would need a more sophisticated approach
  // to track unique voters per gauge per day
  const voterChangeCount = isNewVote ? BigInt(1) : BigInt(-1);
  if (!gaugeMetrics) {
    context.GaugeDailyVotingMetrics.set({
      id: gaugeMetricsId,
      date: dayTimestamp,
      gauge: gauge,
      contract_id: contractId,
      totalVotingPower: isNewVote ? votingPower : -votingPower,
      voterCount: isNewVote ? BigInt(1) : BigInt(0),
      gaugePlugin_id: contractMetricsId,
    });
  } else {
    // Update existing metrics
    const newVotingPower = isNewVote
      ? gaugeMetrics.totalVotingPower + votingPower
      : BigInt(gaugeMetrics.totalVotingPower) - BigInt(votingPower.toString());

    const newVoterCount = gaugeMetrics.voterCount + voterChangeCount;

    context.GaugeDailyVotingMetrics.set({
      id: gaugeMetricsId,
      date: dayTimestamp,
      gauge: gauge,
      contract_id: contractId,
      totalVotingPower: newVotingPower,
      voterCount: newVoterCount < BigInt(0) ? BigInt(0) : newVoterCount,
      gaugePlugin_id: contractMetricsId,
    });
  }
};

// Helper to update contract-wide metrics for a specific day
const updateGaugePluginDailyMetrics = async (
  chainId: Number,
  srcAddress: String,
  votingPower: BigInt,
  dayId: number,
  dayTimestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const contractMetricsId = `${srcAddress}-${dayId}-${chainId}`;
  const contractId = `${chainId}-${srcAddress}`;

  let contractMetrics =
    await context.GaugePluginDailyVotingMetrics.get(contractMetricsId);

  // Calculate the voting power change
  const votingPowerChange = isNewVote ? votingPower : -votingPower;

  if (!contractMetrics) {
    // First metrics for this day
    context.GaugePluginDailyVotingMetrics.set({
      id: contractMetricsId,
      date: dayTimestamp,
      contract_id: contractId,
      totalVotingPower: votingPowerChange,
      votesCount: BigInt(1),
    });
  } else {
    // Update existing metrics
    const newTotalVotingPower =
      contractMetrics.totalVotingPower + votingPowerChange;

    // For accurate voter counts, you'd need a separate tracking mechanism
    // This is a simplified approximation
    const voterCountChange = isNewVote ? BigInt(1) : BigInt(0);

    context.GaugePluginDailyVotingMetrics.set({
      id: contractMetricsId,
      date: dayTimestamp,
      contract_id: contractId,
      totalVotingPower: newTotalVotingPower,
      votesCount: contractMetrics.votesCount + voterCountChange,
    });
  }
};

// Helper to update all-time metrics
const updateAllTimeMetrics = async (
  chainId: Number,
  srcAddress: String,
  voter: String,
  votingPower: BigInt,
  timestamp: number,
  isNewVote: boolean,
  context: Context,
) => {
  const metricsId = `${srcAddress}-${chainId}`;
  const contractId = `${chainId}-${srcAddress}`;

  let metrics = await context.GaugePluginVotingMetrics.get(metricsId);

  // Store a record of whether this voter has voted before to accurately track unique voters
  const voterKey = `${srcAddress}-${voter}-${chainId}`;
  let voterRecord = await context.VoterRegistry.get(voterKey); // Assume VoterRegistry exists

  let isNewVoter = false;
  if (!voterRecord) {
    await addUniqueVoter(chainId, srcAddress, voter, context);
    isNewVoter = true;
  }

  if (!metrics) {
    context.GaugePluginVotingMetrics.set({
      id: metricsId,
      contract_id: contractId,
      allTimeVotingPower: isNewVote ? votingPower : BigInt(0),
      allTimeVoterCount: isNewVoter ? BigInt(1) : BigInt(0),
      allTimeVotesCount: isNewVote ? BigInt(1) : BigInt(0),
      lastUpdated: timestamp,
    });
  } else {
    // Update existing metrics
    const newVotingPower = isNewVote
      ? metrics.allTimeVotingPower + votingPower
      : metrics.allTimeVotingPower;

    const newVoterCount = isNewVoter
      ? metrics.allTimeVoterCount + BigInt(1)
      : metrics.allTimeVoterCount;

    const newVotesCount = isNewVote
      ? metrics.allTimeVotesCount + BigInt(1)
      : metrics.allTimeVotesCount;

    context.GaugePluginVotingMetrics.set({
      id: metricsId,
      contract_id: contractId,
      allTimeVotingPower: newVotingPower,
      allTimeVoterCount: newVoterCount,
      allTimeVotesCount: newVotesCount,
      lastUpdated: timestamp,
    });
  }
};
