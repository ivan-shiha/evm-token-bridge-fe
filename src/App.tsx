import * as React from "react";
import styled from "styled-components";
import Column from "./components/Column";
import ConnectButton from "./components/ConnectButton";
import Header from "./components/Header";
import Loader from "./components/Loader";
import TabsComponent from "./components/TabsComponent";
import { useWeb3Provider } from "./components/Web3Context";
import Wrapper from "./components/Wrapper";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

const App = () => {

  const { connected, address, chainId, resetApp, fetching, onConnect } = useWeb3Provider();

  return (
    <SLayout>
      <Column maxWidth={1000} spanHeight>
        <Header
          connected={connected}
          address={address}
          chainId={chainId}
          killSession={resetApp}
        />
        <SContent>
          {fetching ? (
            <Column center>
              <SContainer>
                <Loader />
              </SContainer>
            </Column>
          ) : (
              <SLanding center>
                {connected
                  ? <TabsComponent />
                  : <ConnectButton onClick={onConnect} />}
              </SLanding>
            )}
        </SContent>
      </Column>
    </SLayout>
  );
}

export default App;
