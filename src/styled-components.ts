import styled from "styled-components";

export const SForm = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 80vh;
  width: 30vw;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(8.5px);
  -webkit-backdrop-filter: blur(8.5px);
  border-radius: 10px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  .error {
    color: red;
    font-family: sans-serif;
    font-size: 12px;
    height: 30px;
  }
`;

export const SHeadline = styled.h2`
  border-bottom: 1px solid white;
  color: #3d3d3d;
  font-family: sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
  padding: 10px;
  text-align: center;
`;

export const SInputContainer = styled.div`
  text-align: center;
  color: black;
`;

export const SInput = styled.input`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 10px;
  width: 100%;
`;

export const SLabel = styled.div`
  color: #3d3d3d;
  display: block;
  font-family: sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
`;

export const SSelect = styled.select`

`;

export const SOption = styled.option`
`;

export const SDiv = styled.div`
  position: relative;
  width: 100%;
`;

export const SSymbol = styled.div`
  position: absolute;
  right: 3px; 
  top: 3px;
  border: 0;
  background: #d1095e;
  color: #fff;
  outline: none;
  margin: 0;
  padding: 0 10px;
  border-radius: 100px;
  z-index: 2;
`;

export const SNestedButton = styled.button`
  position: absolute;
  right: 3px; 
  top: 3px;
  bottom: 3px;
  border: 0;
  background: #d1095e;
  color: #fff;
  outline: none;
  margin: 0;
  padding: 0 10px;
  border-radius: 100px;
  z-index: 2;
`;
