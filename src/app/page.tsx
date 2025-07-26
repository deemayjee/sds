'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import DetailedAnalysis from '@/components/DetailedAnalysis';
import WalletConnection from '@/components/WalletConnection';
import { solanaTracker } from '@/services/solanaTracker';

interface TokenLoss {
  mint: string;
  name: string;
  symbol: string;
  lossAmount: number;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  date: string;
  imageUrl?: string;
}

export default function Home() {
  const { authenticated, user, logout } = usePrivy();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [tokenLosses, setTokenLosses] = useState<TokenLoss[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [processedTransactions, setProcessedTransactions] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Average chemo session cost in the US
  const averageChemoCost = 12000; 

  const totalLoss = tokenLosses.reduce((sum, loss) => sum + loss.lossAmount, 0);
  const chemoSessions = Math.floor(totalLoss / averageChemoCost);

  useEffect(() => {
    if (authenticated && user) {
      const address = user.wallet?.address || 
                     (user.linkedAccounts?.[0] as { address?: string })?.address ||
                     '';
      setWalletAddress(address);
    }
  }, [authenticated, user]);

  const handleConnect = () => {

  };

  const handleAnalyzeAnotherWallet = async () => {
    try {
      await logout();
      
      setShowResults(false);
      setTokenLosses([]);
      setTotalTransactions(0);
      setProcessedTransactions(0);
      setError('');
      setWalletAddress('');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleAnalyzeWallet = async () => {
    if (!walletAddress) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      console.log('Analyzing wallet:', walletAddress);
      
      // Fetch token losses from SolanaTracker API
      const analysisResult = await solanaTracker.getWalletTokenLosses(walletAddress);
      
      setTokenLosses(analysisResult.losses);
      setTotalTransactions(analysisResult.totalTransactions);
      setProcessedTransactions(analysisResult.processedTransactions);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to analyze wallet:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          setError('Wallet not found or has no trading history.');
        } else if (error.message.includes('rate limit')) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (error.message.includes('SolanaTracker')) {
          setError('Unable to fetch memecoin data. The service may be temporarily unavailable.');
        } else {
          setError('Failed to analyze wallet. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#daebff] flex flex-col">
        <header className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-black">SDS</h1>
              </div>
              <WalletConnection onConnect={handleConnect} />
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="font-bold text-black mb-6" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
                Welcome to Solana Donation Shamer!
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Connect your Solana wallet to calculate how many chemotherapy sessions 
                you could have funded with your Memecoin token losses.
              </p>
            </div>
            
            <div className="card max-w-md mx-auto mb-8 md:mb-0">
              <div className="text-center">
                <div className="text-lg font-semibold text-black mb-4">
                  Why Connect Your Wallet?
                </div>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-start">
                    Analyze your actual Solana transaction history
                  </li>
                  <li className="flex items-start">
                    Calculate real SPL token losses from blockchain data
                  </li>
                  <li className="flex items-start">
                    See the true impact of your investment decisions
                  </li>
                  <li className="flex items-start">
                    Your data stays private and secure
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-black text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-lg mb-2">
              Solana Donation Shamer
            </p>
            <p className="text-gray-400">
              Making Memecoin losses meaningful by showing their real-world impact.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#daebff]">
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">SDS</h1>
            </div>
            <WalletConnection onConnect={handleConnect} />
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-black mb-6">
            Your Memecoin Token Reality Check!
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Let&apos;s analyze your wallet&apos;s first 300 memecointransactions to calculate how many chemotherapy sessions 
            you could have funded instead of losing money on Shitters!
          </p>
          
          {walletAddress && (
            <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Connected Wallet:</p>
              <p className="font-mono text-sm text-black break-all">{walletAddress}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {!showResults && (
            <button
              onClick={handleAnalyzeWallet}
              disabled={isAnalyzing || !walletAddress}
              className={`btn-primary text-xl px-12 py-4 ${(isAnalyzing || !walletAddress) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Analyzing Your Transactions...
                </div>
              ) : (
                'Analyze My Wallet'
              )}
            </button>
          )}
        </div>
      </section>

      {showResults && (
        <>
          <section className="py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-black mb-8">
                  Your Impact Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card text-center">
                    <div className="text-5xl font-bold text-red-600 mb-4">
                      ${totalLoss.toLocaleString()}
                    </div>
                    <div className="text-xl text-gray-600">Total Lost on Memecoins</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Money that could have saved lives
                    </div>
                  </div>
                  <div className="card text-center">
                    <div className="text-5xl font-bold text-green-600 mb-4">
                      {chemoSessions}
                    </div>
                    <div className="text-xl text-gray-600">Chemo Sessions Lost</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Based on ${averageChemoCost.toLocaleString()} per session
                    </div>
                  </div>
                </div>
                
                {totalLoss === 0 && (
                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-4xl mb-4">🎉</div>
                    <h4 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h4>
                    <p className="text-green-700">
                      You haven&apos;t lost money on Memecoins in your first 300 transactions. Keep up the good trading decisions!
                    </p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleAnalyzeAnotherWallet}
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    Analyze Another Wallet
                  </button>
                </div>
              </div>
            </div>
          </section>

          {tokenLosses.length > 0 && (
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <DetailedAnalysis 
                  losses={tokenLosses} 
                  chemoCost={averageChemoCost} 
                  totalTransactions={totalTransactions}
                  processedTransactions={processedTransactions}
                />
              </div>
            </section>
          )}
        </>
      )}

      <footer className="bg-black text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-4">
           Solana Donation Shamer
          </p>
          <p className="text-gray-400">
            Making Memecoin losses meaningful by showing their real-world impact.
          </p>
        </div>
      </footer>
    </div>
  );
}
