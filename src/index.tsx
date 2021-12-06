import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalStyle } from "styled-components";
import App from "./App";
import { Web3Provider } from "./components/Web3Context";
import { globalStyle } from "./styles";

const GlobalStyle = createGlobalStyle`
  ${globalStyle}
`;

// @ts-ignore
declare global {
  // tslint:disable-next-line
  interface Window {
    web3: any;
    ethereum: any;
    Web3Modal: any;
    Box: any;
    box: any;
    space: any;
  }
}

ReactDOM.render(
  <>
    <GlobalStyle />
    <Web3Provider>
      <App />
    </Web3Provider>
  </>,
  document.getElementById("root")
);
