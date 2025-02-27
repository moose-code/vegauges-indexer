import {
  SimpleGaugeVoter,
  SimpleGaugeVoter_AdminChanged,
  SimpleGaugeVoter_BeaconUpgraded,
  SimpleGaugeVoter_GaugeActivated,
  SimpleGaugeVoter_GaugeCreated,
  SimpleGaugeVoter_GaugeDeactivated,
  SimpleGaugeVoter_GaugeMetadataUpdated,
  SimpleGaugeVoter_Initialized,
  SimpleGaugeVoter_Paused,
  SimpleGaugeVoter_Reset,
  SimpleGaugeVoter_Unpaused,
  SimpleGaugeVoter_Upgraded,
  SimpleGaugeVoter_Voted,
} from "generated";
import {
  setContractData,
  addVotedDayData,
  resetVotedDayData,
  addUniqueVoter,
} from "./helpers";

SimpleGaugeVoter.AdminChanged.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: SimpleGaugeVoter_AdminChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousAdmin: event.params.previousAdmin,
    newAdmin: event.params.newAdmin,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_AdminChanged.set(entity);
});

SimpleGaugeVoter.BeaconUpgraded.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: SimpleGaugeVoter_BeaconUpgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    beacon: event.params.beacon,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_BeaconUpgraded.set(entity);
});

SimpleGaugeVoter.GaugeActivated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeActivated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_GaugeActivated.set(entity);
});

SimpleGaugeVoter.GaugeCreated.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: SimpleGaugeVoter_GaugeCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    creator: event.params.creator,
    metadataURI: event.params.metadataURI,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_GaugeCreated.set(entity);
});

SimpleGaugeVoter.GaugeDeactivated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeDeactivated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_GaugeDeactivated.set(entity);
});

SimpleGaugeVoter.GaugeMetadataUpdated.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_GaugeMetadataUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    gauge: event.params.gauge,
    metadataURI: event.params.metadataURI,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_GaugeMetadataUpdated.set(entity);
});

SimpleGaugeVoter.Initialized.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: SimpleGaugeVoter_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    version: event.params.version,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_Initialized.set(entity);
});

SimpleGaugeVoter.Paused.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_Paused.set(entity);
});

SimpleGaugeVoter.Reset.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Reset = {
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

  context.SimpleGaugeVoter_Reset.set(entity);
  resetVotedDayData(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.votingPowerRemovedFromGauge,
    Number(event.params.timestamp),
    context,
  );
});

SimpleGaugeVoter.Unpaused.handler(async ({ event, context }) => {
  setContractData(event.chainId, event.srcAddress, context);

  const entity: SimpleGaugeVoter_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_Unpaused.set(entity);
});

SimpleGaugeVoter.Upgraded.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    implementation: event.params.implementation,
    contract_id: `${event.chainId}_${event.srcAddress}`,
  };

  context.SimpleGaugeVoter_Upgraded.set(entity);
});

SimpleGaugeVoter.Voted.handler(async ({ event, context }) => {
  const entity: SimpleGaugeVoter_Voted = {
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

  context.SimpleGaugeVoter_Voted.set(entity);

  addVotedDayData(
    event.chainId,
    event.srcAddress,
    event.params.gauge,
    event.params.votingPowerCastForGauge,
    Number(event.params.timestamp),
    context,
  );
  addUniqueVoter(event.chainId, event.srcAddress, event.params.voter, context);
});
