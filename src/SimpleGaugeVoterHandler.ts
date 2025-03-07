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
import { fetchIpfs } from "./utils/ipfs";

SimpleGaugeVoter.GaugeActivated.handler(async ({ event, context }: any) => {
  const entity: GaugeActivated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.GaugeActivated.set(entity);
});

type GaugeMetadata = {
  name: string;
  address: string;
  description: string;
  logo: string;
  resources: {
    name: string;
    url: string;
  }[];
};

SimpleGaugeVoter.GaugeCreated.handler(async ({ event, context }: any) => {
  await setContractData(event.chainId, event.srcAddress, context);

  const metadata = await fetchIpfs<GaugeMetadata>(event.params.metadataURI, context);

  const entity: GaugeCreated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    creator: event.params.creator,
    metadataURI: event.params.metadataURI,
    metadata: JSON.stringify(metadata),
    name: metadata.name,
    logo: metadata.logo,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.GaugeCreated.set(entity);
});

SimpleGaugeVoter.GaugeDeactivated.handler(async ({ event, context }: any) => {
  const entity: GaugeDeactivated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.GaugeDeactivated.set(entity);
});

SimpleGaugeVoter.GaugeMetadataUpdated.handler(async ({ event, context }: any) => {
  const metadata = await fetchIpfs<GaugeMetadata>(event.params.metadataURI, context);

  const entity: GaugeMetadataUpdated = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    gauge: event.params.gauge,
    metadataURI: event.params.metadataURI,
    metadata: JSON.stringify(metadata),
    name: metadata.name,
    logo: metadata.logo,
    contract_id: `${event.chainId}-${event.srcAddress}`,
  };

  context.GaugeMetadataUpdated.set(entity);
});

SimpleGaugeVoter.Reset.handler(async ({ event, context }: any) => {
  const entity: VoteReset = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerRemovedFromGauge: event.params.votingPowerRemovedFromGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
    contract_id: `${event.chainId}-${event.srcAddress}`,
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

SimpleGaugeVoter.Voted.handler(async ({ event, context }: any) => {
  const entity: Vote = {
    id: `${event.chainId}-${event.block.number}-${event.logIndex}`,
    voter: event.params.voter,
    gauge: event.params.gauge,
    epoch: event.params.epoch,
    tokenId: event.params.tokenId,
    votingPowerCastForGauge: event.params.votingPowerCastForGauge,
    totalVotingPowerInGauge: event.params.totalVotingPowerInGauge,
    totalVotingPowerInContract: event.params.totalVotingPowerInContract,
    timestamp: event.params.timestamp,
    contract_id: `${event.chainId}-${event.srcAddress}`,
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
