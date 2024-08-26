'use client';

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import BN from 'bn.js';
import LPABI from '@/utils/BFG.json';

// Ensure LPABI is correctly formatted and contains the 'getReserves' method
const lpABI = LPABI;

const lpAddress = '0xe0625903565bfCDd738b7AB9b156CB14DC9977b3'; // Replace with your LP contract address
const bfgTokenAddress = '0xBb46693eBbEa1aC2070E59B4D043b47e2e095f86'; // Replace with your BFG token address

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));

// Define the type for the reserves structure
interface Reserves {
  _reserve0: string;
  _reserve1: string;
  _blockTimestampLast: string;
}

const fetchBfgPrice = async (): Promise<number | null> => {
  try {
    const lpContract = new web3.eth.Contract(lpABI as any, lpAddress);
    const reserves = await lpContract.methods.getReserves().call() as Reserves;
    console.log(reserves)
    const reserve0 = new BN(reserves._reserve0);
    const reserve1 = new BN(reserves._reserve1);

    const isBfgReserve0 = bfgTokenAddress.toLowerCase() === lpAddress.toLowerCase(); // Replace with actual logic
    const bfgReserve = isBfgReserve0 ? reserve0 : reserve1;
    const usdtReserve = isBfgReserve0 ? reserve1 : reserve0;

    const bfgReserveInEth = web3.utils.fromWei(bfgReserve.toString(), 'ether');
    const usdtReserveInEth = web3.utils.fromWei(usdtReserve.toString(), 'ether');

    const bfgPrice = parseFloat(usdtReserveInEth) / parseFloat(bfgReserveInEth);
    return bfgPrice;
  } catch (error) {
    console.error('Error fetching BFG price:', error);
    return null;
  }
};

const BfgPricePage = () => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const getPrice = async () => {
      const price = await fetchBfgPrice();
      setPrice(price);
    };

    getPrice();
    const intervalId = setInterval(getPrice, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl mb-4">BFG Token Price</h1>
      {price !== null ? (
        <p className="text-5xl font-semibold">${price.toFixed(5)}</p>
      ) : (
        <p className="text-lg">Loading...</p>
      )}
    </div>
  );
};

export default BfgPricePage;
