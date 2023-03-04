import React, { useState, useEffect } from "react";

import connectWallet from "./interact/connectWallet";
import connectedWallets from "./interact/connectedWallets";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loading from "react-loading";

import raffle from "./raffle.json";

import { RWebShare } from "react-web-share";

import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaDiscord,
  FaTelegram,
  FaShare,
} from "react-icons/fa";

function App() {
  const ethers = require("ethers");

  const [connectButton, setConnectButton] = useState(false);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [numberOfRounds, setNumberOfRounds] = useState("");
  const [entered, setEntered] = useState(false);
  const [calculatingWinner, setCalculatingWinner] = useState(false);
  const [numberOfEntries, setNumberOfEntries] = useState("");
  const [state, setState] = useState("");

  const [winnersDataArray, setWinnersDataArray] = useState([]);
  const [claimed, setClaimed] = useState(false);

  const location = window.location.href;

  async function enterGame() {
    setEntered(true);
    try {
      // steps to call our contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Pull the deployed contract instance
      let contract = new ethers.Contract(raffle.address, raffle.abi, signer);

      // interact with contract
      let playerAddress = await signer.getAddress();
      let entry = await contract.enterGame({ value: 16500000000000000n });
      let txn = await entry.wait(1);
      setEntered(false);
      console.log(txn);
      toast("Congrats! You have entered the Raffle!", { type: "success" });
      getData();
      getNumberOfEntries(playerAddress);
    } catch (error) {
      alert(error);
    }
  }

  // function to get data from smart contract
  async function getData() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://data-seed-prebsc-1-s1.binance.org:8545"
      );
      // const signer = provider.getSigner();
      const signer = new ethers.Wallet(
        // Put your private key here,
        provider
      );
      console.log(signer);

      let contract = new ethers.Contract(raffle.address, raffle.abi, signer);

      // getting data from contract
      let response_1 = await contract.getNumberOfPlayers();
      console.log("number of players", response_1.toString());
      setNumberOfPlayers(response_1.toString());
      let response_2 = await contract.getNumberOfRounds();
      console.log("number of round", response_2.toString());
      setNumberOfRounds(response_2.toString());
      let response_3 = await contract.getState();
      console.log("state is", response_3);
      if (response_3 === 0) {
        setState("Raffle is OPEN");
      } else {
        setState("Raffle is selecting the winner!");
      }
      if (response_1.toString() === "5") {
        setCalculatingWinner(true);
        let response_4 = await contract.pickWinner();
        await response_4.wait(1);
        let response_5 = await contract.getWinner();
        let response_6 = await contract.getNumberOfPlayers();
        let response_7 = await contract.getNumberOfRounds();
        setCalculatingWinner(false);
        setNumberOfPlayers(response_6.toString());
        setNumberOfRounds(response_7.toString());
        setNumberOfEntries("0");
        toast(`Winner is : ${response_5}`, { type: "success" });
        displayDataOfWinners();
      }
    } catch (error) {
      alert(error);
    }
  }

  async function getNumberOfEntries(_addressConnected) {
    if (_addressConnected.length != "") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        let contract = new ethers.Contract(
          raffle.address,
          raffle.abi,
          provider
        );

        // interact with contract
        let entry = await contract.getNumberOfEntries(_addressConnected);
        console.log(
          "number of entrancies for this wallet is",
          entry.toString()
        );
        setNumberOfEntries(entry.toString());
      } catch (error) {
        alert(error);
      }
    }
  }

  async function displayDataOfWinners() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      let contract = new ethers.Contract(raffle.address, raffle.abi, provider);

      // interact with contract
      let result = await contract.getWinnersData();
      setWinnersDataArray(result);
    } catch (error) {
      alert(error);
    }
  }

  async function claimRewards() {
    setClaimed(true);
    try {
      // steps to call our contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Pull the deployed contract instance
      let contract = new ethers.Contract(raffle.address, raffle.abi, signer);

      // interact with contract
      let transaction = await contract.withdrawFunds();
      await transaction.wait(1);
      setClaimed(false);
      toast("Congrats, successfull withdrawal!", { type: "success" });
    } catch (error) {
      alert(error);
    }
  }

  async function connectWalletPressed() {
    setConnectButton(true);
    const response = await connectWallet();
    setAddress(response.address);
    setStatus(response.status);
    setConnectButton(false);
    if (response.address.length > 0) {
      toast("Connected successfully!", { type: "success" });
      getNumberOfEntries(response.address);
      getData();
      displayDataOfWinners();
    } else {
      toast("Please install Metamask!", { type: "warning" });
    }
  }

  async function walletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          getNumberOfEntries(accounts[0]);
          getData();
          displayDataOfWinners();
        } else {
          setAddress("");
        }
      });
    } else {
      return <div>Install metamask</div>;
    }
  }

  useEffect(() => {
    async function fetchData() {
      const response = await connectedWallets();
      setAddress(response);
      getNumberOfEntries(response);
    }

    fetchData();
    walletListener();
    getData();
    displayDataOfWinners();
  }, []);

  return (
    <div className="App">
      <ToastContainer />
      <div className="navbar">
        <h1>SPIN LUCKY GAME</h1>
        <button className="button" onClick={connectWalletPressed}>
          {address.length > 0 ? (
            "Connected: " +
            String(address).substring(0, 6) +
            "..." +
            String(address).substring(38)
          ) : (
            <span className="beforeConnecting">Connect wallet</span>
          )}
        </button>
        {connectButton && (
          <div className="loading-modal">
            <Loading type="spin" color="black" height={20} width={20} />
          </div>
        )}
      </div>
      <div className="spinner_selecting_winner">
        {calculatingWinner && (
          <div className="loading-modal">
            <div className="center">
              <p> Please wait, SELECTING WINNER</p> <br />
              <Loading type="spin" color="black" height={20} width={20} />
            </div>
          </div>
        )}
        {claimed && (
          <div className="center">
            <p>Withdrawing...</p>
            <Loading type="spin" color="black" height={20} width={20} />
          </div>
        )}
      </div>
      <div className="game">
        <div className="game_data">
          <p className="round_number">Round : {numberOfRounds} </p>
          <p className="raffle_state">{state}</p>
          <p className="number_of_players">
            Number of players : {numberOfPlayers}{" "}
          </p>
          <p className="player_address">
            Player's wallet address : <span>{address}</span>
          </p>
          <p className="number_of_entrancies">
            Number of entrancies : {numberOfEntries}{" "}
          </p>
        </div>
        <div className="game_description">
          <h2>WIN 100$ EVERY SPIN WITH JUST 5$</h2>
          <h3>Winner takes it all</h3>
          <p>
            To participate in the Lucky Spin Game, players are required to pay
            an entry price of 0.0165 BNB (=5$) which will grant them a single
            entry into the game. When the number of players reaches 20, you will
            be able to see the winner. Once the winner is announced, the game
            can start again. P.S : Winner will have to pay a charging fee of 25%
            to be able to withdraw his funds.
          </p>
          <button className="entrancy_button" onClick={enterGame}>
            Enter the Game
          </button>
          <div className="spinner_enter_game">
            {entered && (
              <div className="loading-modal">
                <Loading type="spin" color="black" height={20} width={20} />
              </div>
            )}
          </div>
          <RWebShare
            data={{
              text: "WIN 100 BUSD EVERY SPIN WITH JUST 5 BUSD",
              url: `${location}`,
              title: "SPIN LUCKY GAME",
            }}
            onClick={() => console.log("shared successfully!")}
          >
            <button className="share">
              {" "}
              <FaShare /> Share 🔗
            </button>
          </RWebShare>
          <div className="socials">
            <a href="https://www.google.com/" target="_blank">
              {" "}
              <FaInstagram />
            </a>
            <a href="https://www.google.com/" target="_blank">
              {" "}
              <FaFacebook />
            </a>
            <a href="https://www.google.com/" target="_blank">
              {" "}
              <FaTwitter />
            </a>
            <a href="https://www.google.com/" target="_blank">
              <FaTelegram />
            </a>
            <a href="https://www.google.com/" target="_blank">
              {" "}
              <FaDiscord />
            </a>
          </div>
        </div>
      </div>
      <div className="data">
        {/* <button onClick={winnersData}>data of winners</button> */}
        <div className="table_page">
          <table>
            <tr>
              <th>Round</th>
              <th>Winner address</th>
              <th>Amount gained</th>
              <th className="claimButton">Claiming</th>
            </tr>
            {winnersDataArray.map((val, key) => {
              return (
                <tr key={key}>
                  <td>{val[0].toString()}</td>
                  <td>{val[1]}</td>
                  <td>{ethers.utils.formatEther(val[2].toString())} BNB</td>
                  <td>
                    <button className="claiming" onClick={claimRewards}>
                      Claim amount
                    </button>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
        {/* {winnersDataArray.map((val, key) => {
          return (
            <span key={key}>
              <span>
                {" "}
                {val[0].toString()}, {val[1]} , {val[2].toString()} <br />
              </span>
            </span>
          );
        })} */}
      </div>
    </div>
  );
}

export default App;
