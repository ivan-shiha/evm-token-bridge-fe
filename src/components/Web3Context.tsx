import { Web3Provider as W3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, { useContext, useEffect, useState } from "react";
import { swithNetworks } from "src/helpers/switch-networks";
import { getChainData } from "src/helpers/utilities";
import Web3Modal from "web3modal";
import { getTokenBridgeContractAddress, getEscrowContractAddress } from "src/helpers/contracts";
import { Contract } from "ethers";
import { getContract } from "src/helpers/ethers";
import { tokenBridgeABI } from "src/helpers/abi";

const Web3Context = React.createContext<IWeb3Context | undefined>(undefined);

let web3Modal: Web3Modal;

interface IProps {
  children: React.ReactNode
}

interface IWeb3Context {
  connected: boolean,
  address: string,
  chainId: number,
  resetApp: () => {},
  fetching: boolean,
  onConnect: () => {},
  library: W3Provider,
  changeNetwork: (id: number) => Promise<void>,
  changeTab: (id: number) => void,
  activeTabId: number,
  escrowAddress: string,
  tokenBridge: Contract | undefined
}

export const Web3Provider = ({ children }: IProps) => {

  const [provider, setProvider] = useState<any>();
  const [fetching, setFetching] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [library, setLibrary] = useState<any>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number>(1);
  const [pendingRequest, setPedningRequest] = useState<boolean>(false);
  const [result, setResult] = useState<any>();
  const [libraryContract, setLibraryContract] = useState<any>(null);
  const [info, setInfo] = useState<any>(null);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  const [escrowAddress, setEscrowAddress] = useState<string>("");
  const [tokenBridge, setTokenBridge] = useState<Contract>();

  useEffect(() => {
    web3Modal = new Web3Modal({
      network: getNetwork(),
      cacheProvider: true,
      providerOptions: getProviderOptions()
    })
    if (web3Modal.cachedProvider) {
      onConnect();
    }
  }, []);

  const onConnect = async () => {
    const provider = await web3Modal.connect();
    setProvider(provider);
    const library = new W3Provider(provider, "any");
    const network = await library.getNetwork();
    const providerAddress = provider.selectedAddress ? provider.selectedAddress : provider?.accounts[0];
    setLibrary(library);
    setChainId(network.chainId);
    setAddress(providerAddress);
    setConnected(true);
    setEscrowAddress(getEscrowContractAddress(network.chainId));
    setTokenBridge(getContract(getTokenBridgeContractAddress(network.chainId), tokenBridgeABI, library, providerAddress));
    await subscribeToProviderEvents(provider);
  };

  const subscribeToProviderEvents = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("accountsChanged", changedAccount);
    provider.on("chainChanged", chainChanged);
    provider.on("disconnect", resetApp);
    provider.on("network", (newNetwork: any, oldNetwork: any) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
        window.location.reload();
      }
    });
    await web3Modal.off("accountsChanged");
  };

  const unSubscribe = async (provider: any) => {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload(false);
    if (!provider.off) {
      return;
    }
    provider.off("accountsChanged", changedAccount);
    provider.off("chainChanged", chainChanged);
    provider.off("disconnect", resetApp);
  }

  const changedAccount = async (accounts: string[]) => {
    if (!accounts.length) {
      // Metamask Lock fire an empty accounts array 
      await resetApp();
    } else {
      setAddress(accounts[0]);
    }
  }

  const chainChanged = async (id: number) => {
    const provider = await web3Modal.connect();
    setProvider(provider);
    const providerAddress = provider.selectedAddress ? provider.selectedAddress : provider?.accounts[0];
    const library = new W3Provider(provider, "any");
    const network = await library.getNetwork();
    const networkId = network.chainId;
    setChainId(networkId);
    setLibrary(library);
    setEscrowAddress(getEscrowContractAddress(networkId));
    setTokenBridge(getContract(getTokenBridgeContractAddress(networkId), tokenBridgeABI, library, providerAddress));
  }

  function getNetwork() {
    return getChainData(chainId).network;
  }

  function getProviderOptions() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    };
    return providerOptions;
  };

  const resetApp = async () => {
    await web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await unSubscribe(provider);
  };

  const resetState = () => {
    setFetching(false);
    setAddress("");
    setLibrary(null);
    setConnected(false);
    setChainId(1);
    setPedningRequest(false);
    setResult(null);
    setLibraryContract(null);
    setInfo(null);
  }

  const changeNetwork = async (networkId: number) => {
    await swithNetworks(networkId);
  }

  const changeTab = (tabId: number) => {
    setActiveTabId(tabId);
  }

  const contextValue = {
    connected,
    address,
    chainId,
    resetApp,
    fetching,
    onConnect,
    library,
    changeNetwork,
    changeTab,
    activeTabId,
    escrowAddress,
    tokenBridge
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3Provider = () => {
  const context: IWeb3Context | undefined = useContext(Web3Context);
  if (!context) {
    throw new Error(
      "useWeb3Provider error"
    );
  }
  return context;
}
