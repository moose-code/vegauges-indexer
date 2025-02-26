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
