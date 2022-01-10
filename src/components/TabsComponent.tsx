import React from "react";
import styled from "styled-components";
import Claim from "./Claim";
import Transfer from "./Transfer";
import { useWeb3Provider } from "./Web3Context";

const SWrapper = styled.div`
  width: 800px;
  margin: 30px auto;
`;

const STabItemsContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const STabItem = styled.div`
  border: 2px solid #fff;
  cursor: pointer;
  width: 100px;
  height: 100px;
  text-align: center;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const tabItems = [
  {
    id: 1,
    title: "Transfer"
  },
  {
    id: 2,
    title: "Claim"
  }
];

const TabsComponent = () => {

  const { changeTab, activeTabId } = useWeb3Provider();

  return (
    <div>
      <SWrapper>
        <STabItemsContainer>
          {tabItems.map(({ id, title }) => {
            return <STabItem
              key={id}
              onClick={() => changeTab(id)}>
              <p>{title}</p>
            </STabItem>
          })}
        </STabItemsContainer>
        {activeTabId === 1
          ? <Transfer />
          : <Claim />}
      </SWrapper>
    </div>

  );
}

export default TabsComponent;
