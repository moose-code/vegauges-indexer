import {
  SimpleGaugeVoter,
  GaugeActivated,
  GaugeCreated,
  GaugeDeactivated,
  GaugeMetadataUpdated,
  VoteReset,
  Vote,
} from "generated";
import {
  setContractData,
  updateVotingMetrics,
  addUniqueVoter,
} from "./helpers";

SimpleGaugeVoter.GaugeActivated.handler(async ({ event, context }) => {
  const entity: GaugeActivated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.GaugeActivated.set(entity);
});

SimpleGaugeVoter.GaugeCreated.handler(async ({ event, context }) => {
  await setContractData(event.chainId, event.srcAddress, context);

  const entity: GaugeCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    creator: event.params.creator,
    metadataURI: event.params.metadataURI,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.GaugeCreated.set(entity);
});

SimpleGaugeVoter.GaugeDeactivated.handler(async ({ event, context }) => {
  const entity: GaugeDeactivated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.GaugeDeactivated.set(entity);
});

SimpleGaugeVoter.GaugeMetadataUpdated.handler(async ({ event, context }) => {
  const entity: GaugeMetadataUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    metadataURI: event.params.metadataURI,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.GaugeMetadataUpdated.set(entity);
});

SimpleGaugeVoter.Reset.handler(async ({ event, context }) => {
  const entity: VoteReset = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerRemovedFromGauge: event.params.votingPowerRemovedFromGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.VoteReset.set(entity);
  await updateVotingMetrics(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.voter,
    event.params.votingPowerRemovedFromGauge,
    event.params.totalVotingPowerInGauge,
    event.params.totalVotingPowerInContract,
    Number(event.params.timestamp),
    false,
    context,
  );
});

SimpleGaugeVoter.Voted.handler(async ({ event, context }) => {
  const entity: Vote = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerCastForGauge: event.params.votingPowerCastForGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.Vote.set(entity);

  await addUniqueVoter(event.chainId, event.srcAddress, event.params.voter, context);
  await updateVotingMetrics(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.voter,
    event.params.votingPowerCastForGauge,
    event.params.totalVotingPowerInGauge,
    event.params.totalVotingPowerInContract,
    Number(event.params.timestamp),
    true,
    context,
  );
});
