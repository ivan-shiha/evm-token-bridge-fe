import { isAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

export function isValidAddress(address: string) {
  return isAddress(address) && address !== AddressZero;
}

export function getSigner(library: Web3Provider, account: string): Signer {
  return library.getSigner(account).connectUnchecked();
}

export function getProviderOrSigner(library: Web3Provider, account: string): Signer | Web3Provider {
  return account ? getSigner(library, account) : library;
}

export function getContract(address: string, ABI: any, library: Web3Provider, account: string): Contract {
  if (!isValidAddress(address)) {
    throw Error(`Invalid "address" parameter "${address}".`);
  }
  return new Contract(address, ABI, getProviderOrSigner(library, account));
}
