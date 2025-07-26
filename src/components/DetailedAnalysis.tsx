'use client';

import { useState } from 'react';
import TokenLossCard from './TokenLossCard';
import StatsCard from './StatsCard';
import { BadgeDollarSign, HeartPulse, TrendingDown, BarChart3, Coins } from 'lucide-react';

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

interface DetailedAnalysisProps {
  losses: TokenLoss[];
  chemoCost: number;
  totalTransactions: number;
  processedTransactions: number;
}

export default function DetailedAnalysis({ losses, chemoCost, totalTransactions, processedTransactions }: DetailedAnalysisProps) {
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'percentage'>('amount');
  const [filterBy, setFilterBy] = useState<string>('all');

  const totalLoss = losses.reduce((sum, loss) => sum + loss.lossAmount, 0);
  const totalChemoSessions = Math.floor(totalLoss / chemoCost);
  const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0;

  const sortedLosses = [...losses].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.lossAmount - a.lossAmount;
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'percentage':
        const aPercentage = ((a.buyPrice - a.sellPrice) / a.buyPrice) * 100;
        const bPercentage = ((b.buyPrice - b.sellPrice) / b.buyPrice) * 100;
        return bPercentage - aPercentage;
      default:
        return 0;
    }
  });

  const filteredLosses = filterBy === 'all' 
    ? sortedLosses 
    : sortedLosses.filter(loss => loss.lossAmount >= 1000); // Filter for losses greater than $1000

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard
          title="Total Losses"
          value={`$${totalLoss.toLocaleString()}`}
          color="red"
          icon={BadgeDollarSign}
        />
        <StatsCard
          title="Chemo Sessions Lost"
          value={totalChemoSessions}
          color="green"
          icon={HeartPulse}
        />
        <StatsCard
          title="Average Loss"
          value={`$${Math.round(averageLoss).toLocaleString()}`}
          color="orange"
          icon={TrendingDown}
        />
        <StatsCard
          title="Total Transactions"
          value={totalTransactions}
          color="blue"
          icon={BarChart3}
        />
        <StatsCard
          title="Tokens with Losses"
          value={losses.length}
          color="purple"
          icon={Coins}
        />
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h3 className="text-xl font-bold text-black">Your Token Losses</h3>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'amount' | 'date' | 'percentage')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="amount">Sort by Amount</option>
              <option value="date">Sort by Date</option>
              <option value="percentage">Sort by Percentage</option>
            </select>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Losses</option>
              <option value="significant">Significant Losses ($1k+)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLosses.map((loss, index) => (
          <TokenLossCard
            key={`${loss.mint}-${loss.lossAmount}-${loss.date}-${index}`}
            loss={loss}
            chemoCost={chemoCost}
          />
        ))}
      </div>

      {filteredLosses.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-black mb-2">No Losses Found!</h3>
          <p className="text-gray-600">
            {losses.length === 0 
              ? "Great news! You haven't lost money on any SPL tokens in your first 300 transactions, or we couldn't find any completed buy/sell pairs." 
              : "No losses match your current filter criteria."
            }
          </p>
        </div>
      )}
    </div>
  );
} 