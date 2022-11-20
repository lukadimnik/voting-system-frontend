import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import BallotAbi from '../artifacts/Ballot.json';
import BasicNftAbi from '../artifacts/BasicNft.json';
import { Ballot } from './interfaces/contracts/Ballot';
import { BasicNft } from './interfaces/contracts/BasicNft';
import 'dotenv/config';

const ballotAddress = '0x12901a6217Fa4f91341DB6EAeDD5CEd128F8D518';
const basicNftAddress = '0xBe26a0fe741616299C5a75C6E6d20FDD579831AE';

function App() {
  const [count, setCount] = useState(0);
  const [voteOption, setVoteOption] = useState<number>();

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
        basicNftAddress,
        BasicNftAbi.abi,
        signer
      );
      try {
        const transaction = await contract.mintNft();
        transaction.wait(1);
        console.log('Winning proposal data: ', transaction.data);
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
      <h1>Blockchain voting system</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <button onClick={requestAccount}>Connect wallet</button>
      <br />
      <button onClick={mintNft}>Mint Nft</button>
      <br />
      <label>
        Option 1: John, Option 2: Fred:{' '}
        <input
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
