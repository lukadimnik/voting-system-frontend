import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import BallotAbi from '../artifacts/Ballot.json';
import BasicNftAbi from '../artifacts/BasicNft.json';
import { Ballot } from './interfaces/contracts/Ballot';
import { BasicNft } from './interfaces/contracts/BasicNft';

const ballotAddress = import.meta.env.VITE_BALLOT_ADDRESS;
const accessNftAddress = import.meta.env.VITE_ACCESS_NFT_ADDRESS;

function App() {
  const [voteOption, setVoteOption] = useState<number>();
  const [winningProposal, setWinningProposal] = useState<number>();

  const requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const mintNft = async () => {
    console.log('Starting to mint nft...');

    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract: BasicNft = new ethers.Contract(
        accessNftAddress,
        BasicNftAbi.abi,
        signer
      );
      try {
        const transaction = await contract.mintNft();
        transaction.wait(1);
      } catch (error) {
        console.log('Error: ', error);
      }
    }
  };

  const fetchWinningProposal = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract: Ballot = new ethers.Contract(
        ballotAddress,
        BallotAbi.abi,
        provider
      );
      try {
        const data = await contract.winningProposal();
        setWinningProposal(data);
        console.log('Winning proposal data: ', data.toNumber());
      } catch (error) {
        console.log('Error: ', error);
      }
    }
  };

  const vote = async () => {
    if (!voteOption) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract: Ballot = new ethers.Contract(
        ballotAddress,
        BallotAbi.abi,
        signer
      );
      try {
        const transaction = await contract.vote(voteOption);
        transaction.wait(2);
        const data = await contract.winningProposal();
        console.log('Winning proposal data: ', data.toNumber());
      } catch (error) {
        console.log('Error: ', error);
      }
    }
  };

  return (
    <div className="App">
      <button onClick={requestAccount}>Connect wallet</button>
      <button onClick={mintNft}>Mint Nft</button>
      <h1>Blockchain voting system</h1>
      <div className="card"></div>
      <label>
        Option 1: John, Option 2: Fred:{' '}
        <input
          placeholder="option"
          type="number"
          onChange={(event) => setVoteOption(parseInt(event.target.value))}
        />
      </label>
      <br />
      <button onClick={vote}>Vote</button>
      <br />
      <button onClick={fetchWinningProposal}>Get winning proposal</button>
    </div>
  );
}

export default App;
