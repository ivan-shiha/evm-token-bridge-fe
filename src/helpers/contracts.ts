interface IAddress {
  [chainId: number]: string;
}

const TokenBridgeAddress: IAddress = {
  3: "0xCEF632A6A848Bf507DD26FAB711A576ee8155a3c", // ropsten
  4: "0x1c4152FDdA7eb27bbb985325EF6FdbaAE5d8A413", // rinkeby
  5: "0x1c4152FDdA7eb27bbb985325EF6FdbaAE5d8A413", // goerli
  42: "0x9F03bd852b5d8a7269FCD5Fb2B626FE63FDa084e" // kovan
}

const EscrowAddress: IAddress = {
  3: "0x30896D1Cb925E58D579DE4a74e7839e1D0b089e1", // ropsten
  4: "0xADC43af25B60543eE3382BddbC41F4D6F0268536", // rinkeby
  5: "0xADC43af25B60543eE3382BddbC41F4D6F0268536", // goerli
  42: "0x281172BB1E3806A6F98365C76017feC36F6CC2E7" // kovan
}

export const getTokenBridgeContractAddress = (chainId: number): string => {
  return TokenBridgeAddress[chainId];
}

export const getEscrowContractAddress = (chainId: number): string => {
  return EscrowAddress[chainId];
}
