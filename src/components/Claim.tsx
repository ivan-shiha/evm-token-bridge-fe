import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react"
import supportedChains from "src/helpers/chains";
import { logMsg } from "src/helpers/dev";
import { getSigner, isValidAddress } from "src/helpers/ethers";
import { ContractEvent } from "src/helpers/events";
import { convertToBigNumber, generateNonce, prepareMessage, showNotification } from "src/helpers/utilities";
import { SDiv, SForm, SHeadline, SInput, SInputContainer, SLabel, SNestedButton, SOption, SSelect } from "src/styled-components";
import Button from "./Button";
import Spinner from "./Spinner";
import { useWeb3Provider } from "./Web3Context";

const Claim = () => {

  const { chainId, address, library, escrowAddress, tokenBridge } = useWeb3Provider();

  const [isLoading, setIsLoading] = useState(false);

  const [tokenAddress, setTokenAddress] = useState("");
  const [targetNetwork, setTargetNetwork] = useState(0);
  const [amount, setAmount] = useState("");
  const [nonce, setNonce] = useState(BigNumber.from(0));

  useEffect(() => {
    return () => resetForm();
  }, [chainId, address]);

  const resetForm = () => {
    logMsg("claim resetForm");
    setTargetNetwork(0);
    setAmount("");
    setIsLoading(false);
    setNonce(BigNumber.from(0));
  }

  const handleNonceChange = (e: any) => {
    setNonce(e.target.value);
  }

  const handleGenerateNonce = () => {
    setNonce(generateNonce());
  }

  const handleTokenAddressChange = (e: any) => {
    const tokenAddress = e.target.value;

    if (!isValidAddress(tokenAddress)) {
      resetForm();
    }
    setTokenAddress(tokenAddress);
  }

  const handleTargetNetworkChange = (e: any) => {
    setTargetNetwork(Number(e.target.value));
  }

  const handleAmountChange = (e: any) => {
    setAmount(e.target.value);
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (tokenBridge === undefined) {
      return;
    }

    try {
      setIsLoading(true);
      tokenBridge.removeAllListeners();
      tokenBridge.on(ContractEvent.CLAIM, claimEventListener);
      const amountBN = convertToBigNumber(amount, 18);
      const signer = getSigner(library, address);
      const message = prepareMessage(escrowAddress, amountBN, nonce, BigNumber.from(chainId));
      const signature = await signer.signMessage(message);
      const transaction = await tokenBridge.claim(tokenAddress, amountBN, nonce, signature);
      const receipt = await transaction.wait();
      setNotification(receipt);
    } catch (e) {
      logMsg(e);
    }
    finally {
      setIsLoading(false);
    }
  }

  const setNotification = (receipt: any) => {
    showNotification(`transactionHash: ${receipt.transactionHash}
    status: ${receipt.status}
    ${amount ?? "amount: " + amount}`);
  }

  const claimEventListener = (
    tokenAddress: string,
    amount: BigNumber,
    nonce: BigNumber
  ) => {
    logMsg("claimEventListener");
    logMsg("tokenAddress: " + tokenAddress);
    logMsg("amount: " + amount.toString());
    logMsg("nonce: " + nonce.toString());
  }

  return (
    <>
      <SForm onSubmit={handleSubmit}>
        <SHeadline>CLAIM</SHeadline>
        <SInputContainer>
          <SLabel>
            Token Address
          <SInput
              type="text"
              name="tokenAddress"
              onChange={handleTokenAddressChange}
              value={tokenAddress}
              required={true}
            />
          </SLabel>
          <SLabel>
            From
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
          {isLoading
            ? <Spinner />
            : <SDiv>
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
            </SDiv>
          }
        </SInputContainer>
      </SForm>
    </>
  );
}

export default Claim;
