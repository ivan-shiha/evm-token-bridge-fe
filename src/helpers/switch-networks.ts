import { logMsg } from "./dev";

export const swithNetworks = async (id: number) => {
  if (window.ethereum) {
    const chainId = convertChainIdToHex(id);
    try {
      await switchRequest(chainId);
    } catch (error) {
      logMsg(error);
    }
  }
};

const switchRequest = (id: string) => {
  return window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: id }],
  });
};

const convertChainIdToHex = (id: number) => {
  return "0x" + (id).toString(16);
}
