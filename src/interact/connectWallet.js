import React from "react";

const connectWallet = async () => {
  const objectResponse = {
    address: "",
    status: "",
  };
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      objectResponse.address = addressArray[0];
      objectResponse.status = "Successfully connected!";
      return objectResponse;
    } catch (error) {
      return error.message;
    }
  } else {
    return {
      address: "",
      status: (
        <span className="status_error">
          You must install Metamask
          <br />
          <a
            href="https://metamask.io/download/"
            className="metamask_link"
            target="_blank"
            rel="noreferrer"
          >
            Install metamask
          </a>
        </span>
      ),
    };
  }
};

export default connectWallet;
