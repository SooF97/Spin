import React from "react";

const connectedWallets = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        let userAddress = addressArray[0];
        return userAddress;
      } else {
        return "";
      }
    } catch (error) {
      return error.message;
    }
  } else {
    return <div className="metamask">Install metamask</div>;
  }
};

export default connectedWallets;
