import { MaxUint256 } from "@ethersproject/constants/lib/bignumbers";
import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react"
import { erc20ABI } from "src/helpers/abi";
import supportedChains from "src/helpers/chains";
import { logMsg } from "src/helpers/dev";
import { getContract, getSigner, isValidAddress } from "src/helpers/ethers";
import { ContractEvent } from "src/helpers/events";
import { convertToBigNumber, convertToNumber, generateNonce, prepareMessage, showNotification } from "src/helpers/utilities";
import { SDiv, SForm, SHeadline, SInput, SInputContainer, SLabel, SNestedButton, SOption, SSelect, SSymbol } from "src/styled-components";
import Button from "./Button";
import Spinner from "./Spinner";
import { useWeb3Provider } from "./Web3Context";
import { formatEther } from "ethers/lib/utils";

const Transfer = () => {

  const { chainId, address, library, escrowAddress, tokenBridge } = useWeb3Provider();

  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [targetNetwork, setTargetNetwork] = useState(0);
  const [amount, setAmount] = useState("");
  const [tokenMaxBalance, setTokenMaxBalance] = useState("");
  const [nonce, setNonce] = useState(BigNumber.from(0));
  const [serviceFee, setServiceFee] = useState(BigNumber.from(0));

  useEffect(() => {
    return () => resetForm();
  }, [chainId, address]);

  const resetForm = () => {
    logMsg("transfer resetForm");
    setTargetNetwork(0);
    setAmount("");
    setIsLoading(false);
    setIsApproved(false);
    setNonce(BigNumber.from(0));
    setTokenSymbol("");
    setTokenMaxBalance("");
  }

  const handleTargetNetworkChange = (e: any) => {
    setTargetNetwork(Number(e.target.value));
  }

  const handleAmountChange = (e: any) => {
    setAmount(e.target.value);
  }

  const handleMaxButton = (e: any) => {
    e.preventDefault();
    setAmount(tokenMaxBalance);
  }

  const handleNonceChange = (e: any) => {
    setNonce(e.target.value);
  }

  const handleGenerateNonce = () => {
    setNonce(generateNonce());
  }

  const handleTokenAddressChange = async (e: any) => {
    const tokenAddress = e.target.value;

    if (!isValidAddress(tokenAddress)) {
      resetForm();
      setTokenAddress(tokenAddress);
      return;
    }

    try {
      setIsLoading(true);
      const token = getContract(tokenAddress, erc20ABI, library, address);
      const tokenSymbol = await token.symbol();
      const allowance = await token.allowance(address, escrowAddress);
      const balance = await token.balanceOf(address);
      const decimals = await token.decimals();
      const fee = await tokenBridge!.serviceFee();
      setIsApproved(allowance.gte(balance));
      setServiceFee(fee);
      setTokenAddress(tokenAddress);
      setTokenSymbol(tokenSymbol);
      setTokenMaxBalance(convertToNumber(balance, decimals));
    } catch (e) {
      logMsg(e);
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleApproveButton = async (e: any) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const token = getContract(tokenAddress, erc20ABI, library, address);
      const transaction = await token.approve(escrowAddress, MaxUint256);
      const receipt = await transaction.wait();
      setNotification(receipt);
      setIsApproved(true);
    } catch (e) {
      logMsg(e);
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleSubmitButton = async (e: any) => {
    e.preventDefault();

    if (tokenBridge === undefined) {
      return;
    }

    try {
      setIsLoading(true);
      tokenBridge.removeAllListeners();
      tokenBridge.on(ContractEvent.TRANSFER, transferEventListener);
      const amountBN = convertToBigNumber(amount, 18);
      const message = prepareMessage(escrowAddress, amountBN, nonce, BigNumber.from(chainId));
      const signer = getSigner(library, address);
      const signature = await signer.signMessage(message);
      const transaction = await tokenBridge.transfer(tokenAddress, amountBN, nonce, signature, { value: serviceFee });
      const receipt = await transaction.wait();
      setNotification(receipt);
    } catch (e) {
      logMsg(e);
    } finally {
      setIsLoading(false);
    }
  }

  const setNotification = (receipt: any) => {
    showNotification(`transactionHash: ${receipt.transactionHash}
    status: ${receipt.status}
    ${amount ?? "amount: " + amount + " " + tokenSymbol}`);
  }

  const transferEventListener = (
    tokenAddress: string,
    amount: BigNumber,
    nonce: BigNumber
  ) => {
    logMsg("transferEventListener");
    logMsg("tokenAddress: " + tokenAddress);
    logMsg("amount: " + amount.toString());
    logMsg("nonce: " + nonce.toString());
  }

  return (
    <>
      <SForm onSubmit={handleSubmitButton}>
        <SHeadline>TRANSFER</SHeadline>
        <SInputContainer>
          <SDiv>
            <SLabel>
              Token Address
              <SInput
                type="text"
                name="tokenAddress"
                onChange={handleTokenAddressChange}
                value={tokenAddress}
                required={true}
              />
              <SSymbol>{tokenSymbol}</SSymbol>
            </SLabel>
            <SLabel>
              To
          <SSelect
                onChange={handleTargetNetworkChange}
                required={true}
              >
                {supportedChains
                  .filter(c => c.chain_id !== chainId)
                  .map((c, i) => {
                    return <SOption key={i} value={c.chain_id}>{c.name}</SOption>
                  })}
              </SSelect>
            </SLabel>
          </SDiv>
          {isLoading
            ? <Spinner />
            : isApproved
              ?
              <SDiv>
                <SLabel>
                  Amount
                <SDiv>
                    <SInput
                      type="number"
                      name="amount"
                      onChange={handleAmountChange}
                      value={amount}
                      placeholder={"0.0"}
                      min={0}
                      step="any"
                      required={true}
                    />
                    <SNestedButton type="button" onClick={handleMaxButton}>Max</SNestedButton>
                  </SDiv>
                </SLabel>
                <SLabel>
                  Nonce
                  <SDiv>
                    <SInput
                      type="number"
                      name="nonce"
                      onChange={handleNonceChange}
                      value={nonce.toString()}
                      min={0}
                      step="1"
                      required={true}
                    />
                    <SNestedButton type="button" onClick={handleGenerateNonce}>Generate</SNestedButton>
                  </SDiv>
                </SLabel>

                <Button type="submit">
                  Submit
              </Button>
                <SDiv>
                  Service fee: {formatEther(serviceFee)} ETH
                </SDiv>
              </SDiv>
              : <Button type="button" onClick={handleApproveButton}>
                Approve
            </Button>
          }
        </SInputContainer>
      </SForm>
    </>
  );
}

export default Transfer;
