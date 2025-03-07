import { ExitQueue, ExitQueued } from "generated";
import { getDayID, getDayStartTimestamp, setContractData } from "./helpers";
import { Context } from "vm";

ExitQueue.Initialized.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);
});

ExitQueue.ExitQueued.handler(async ({ event, context }) => {
  const votingEscrowAddress = votingEscrow(event.srcAddress);

  const entity: ExitQueued = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    contract_id: `${event.chainId}-${votingEscrowAddress}`,
    tokenId: event.params.tokenId,
    holder: event.params.holder,
    exitDate: event.params.exitDate,
  };

  context.ExitQueued.set(entity);

  updateExitQueueDailyMetrics(
    event.chainId,
    votingEscrowAddress,
    event.params.tokenId,
    event.params.exitDate,
    context,
  );
});

const updateExitQueueDailyMetrics = async (
  chainId: Number,
  votingEscrow: String,
  tokenId: BigInt,
  exitDate: BigInt,
  context: Context,
) => {
  const dayID = getDayID(Number(exitDate));
  const dayStartTimestamp = getDayStartTimestamp(dayID);
  const aggregatedDataID = `${votingEscrow}-${dayID}-${chainId}`;

  let exitQueueData = await context.ExitQueueDailyMetrics.get(aggregatedDataID);

  // Get deposit by tokenId
  const lock = await context.Deposit.get(
    `${tokenId}-${votingEscrow}-${chainId}`,
  );

  if (!lock) {
    throw new Error(`Deposit not found for tokenId ${tokenId}`);
  }

  if (!exitQueueData) {
    const newExitQueueData = {
      id: aggregatedDataID,
      contract_id: `${chainId}-${votingEscrow}`,
      date: dayStartTimestamp,
      amountOfExits: BigInt(1),
      totalTokens: lock.value,
    };
    context.ExitQueueDailyMetrics.set(newExitQueueData);
  } else {
    const updatedExitQueueData = {
      id: aggregatedDataID,
      contract_id: `${chainId}-${votingEscrow}`,
      date: dayStartTimestamp,
      amountOfExits: exitQueueData.amountOfExits + BigInt(1),
      totalTokens: exitQueueData.totalTokens + lock.value,
    };
    context.ExitQueueDailyMetrics.set(updatedExitQueueData);
  }
};

const votingEscrow = (exitQueue: string): String =>
  getVotingEscrowAddressFromExitQueue[exitQueue as keyof typeof getVotingEscrowAddressFromExitQueue];

const getVotingEscrowAddressFromExitQueue = {
  "0x915e50A7C53e05F72122bC883309a812A90bA163":
    "0xff8AB822b8A853b01F9a9E9465321d6Fe77c9D2F",
  "0x1c9B7bD4b3684A0c34Bd9A9b3f7F2dFC8fD81826":
    "0x9c2eFe2a1FBfb601125Bb07a3D5bC6EC91F91e01",
  "0x03477487df4de0B5EF852e7C21A74f9C71f0e910":
    "0x632Ec6569aA76aF2c6AF64e2F048ab8CA16fa5ab",
  "0xa6361bAAF26c7841Dd7Ac69945Fbb9e5362Ab2C7":
    "0xaf5d3878E364b004A964c66e79E7c04F8c110b1C",
  "0xD9C2d314E29F1940d2a65A691881F0950fE4A455":
    "0xA55eD5808aeCDF23AE3782C1443185f5D2363ce7",
};
