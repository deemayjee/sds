const SOLANA_TRACKER_BASE_URL = 'https://data.solanatracker.io';

const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SOLANA_TRACKER_API_KEY || null;
  }
  return process.env.SOLANA_TRACKER_API_KEY || null;
};

interface SolanaTrackerTrade {
  tx: string;
  from: {
    address: string;
    amount: number;
    token: {
      name: string;
      symbol: string;
      image?: string;
      decimals: number;
    };
  };
  to: {
    address: string;
    amount: number;
    token: {
      name: string;
      symbol: string;
      image?: string;
      decimals: number;
    };
  };
  price: {
    usd: number;
    sol: string;
  };
  volume: {
    usd: number;
    sol: number;
  };
  wallet: string;
  program: string;
  time: number;
}

interface SolanaTrackerTradesResponse {
  trades: SolanaTrackerTrade[];
  nextCursor?: number;
  hasNextPage: boolean;
}

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

interface WalletAnalysisResult {
  losses: TokenLoss[];
  totalTransactions: number;
  processedTransactions: number;
}

export class SolanaTrackerService {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getApiKey();
  }

  private async fetchWithAuth(url: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    } else {
      console.warn('SolanaTracker API key not found.');
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (response.status === 401) {
        throw new Error('Error');
      }
      throw new Error(`SolanaTracker API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getWalletTrades(walletAddress: string, limit: number = 300): Promise<SolanaTrackerTradesResponse> {
    const url = `${SOLANA_TRACKER_BASE_URL}/wallet/${walletAddress}/trades?page_size=${limit}&limit=${limit}`;
    
    console.log(`Fetching trades from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'x-api-key': this.apiKey }),
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        throw new Error('Trading history not found');
      }
      throw new Error(`SolanaTracker API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`API returned ${data.trades?.length || 0} trades`);
    
    if (data.trades && data.trades.length > limit) {
      console.log(`Limiting results from ${data.trades.length} to ${limit} trades`);
      data.trades = data.trades.slice(0, limit);
    }

    return data;
  }

  async getWalletTokenLosses(walletAddress: string): Promise<WalletAnalysisResult> {
    try {
      console.log(`Fetching first 300 transactions for wallet: ${walletAddress}`);
      
      // Get the first 300 trades from the wallet
      const tradesData = await this.getWalletTrades(walletAddress, 300);
      
      if (!tradesData.trades || tradesData.trades.length === 0) {
        console.log('No trades found for wallet');
        return {
          losses: [],
          totalTransactions: 0,
          processedTransactions: 0
        };
      }

      console.log(`Found ${tradesData.trades.length} transactions to analyze`);

      const tokenTradeMap = new Map<string, {
        buys: SolanaTrackerTrade[];
        sells: SolanaTrackerTrade[];
        tokenInfo: {
          name: string;
          symbol: string;
          image?: string;
        };
      }>();

      for (const trade of tradesData.trades) {
        const isSolOrStablecoin = (address: string) => {
          return address === 'So11111111111111111111111111111111111111112' || // SOL
                 address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' || // USDC
                 address === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';   // USDT
        };

        let tokenAddress: string;
        let tokenInfo: { name: string; symbol: string; image?: string };
        let isBuy: boolean;

        if (!isSolOrStablecoin(trade.to.address) && isSolOrStablecoin(trade.from.address)) {
          // Buying a token with SOL/stablecoin
          tokenAddress = trade.to.address;
          tokenInfo = trade.to.token;
          isBuy = true;
        } else if (!isSolOrStablecoin(trade.from.address) && isSolOrStablecoin(trade.to.address)) {
          // Selling a token for SOL/stablecoin
          tokenAddress = trade.from.address;
          tokenInfo = trade.from.token;
          isBuy = false;
        } else {
          continue;
        }

        if (!tokenTradeMap.has(tokenAddress)) {
          tokenTradeMap.set(tokenAddress, {
            buys: [],
            sells: [],
            tokenInfo
          });
        }

        const tokenTrades = tokenTradeMap.get(tokenAddress)!;
        if (isBuy) {
          tokenTrades.buys.push(trade);
        } else {
          tokenTrades.sells.push(trade);
        }
      }

      const tokenLosses: TokenLoss[] = [];

      for (const [tokenAddress, { buys, sells, tokenInfo }] of tokenTradeMap) {
        if (buys.length === 0 || sells.length === 0) {
          continue;
        }

        // Calculate total bought and sold amounts in USD
        const totalBoughtUSD = buys.reduce((sum, trade) => sum + trade.volume.usd, 0);
        const totalSoldUSD = sells.reduce((sum, trade) => sum + trade.volume.usd, 0);
        const totalBoughtQuantity = buys.reduce((sum, trade) => {
          return sum + (trade.to.address === tokenAddress ? trade.to.amount : trade.from.amount);
        }, 0);
        const totalSoldQuantity = sells.reduce((sum, trade) => {
          return sum + (trade.from.address === tokenAddress ? trade.from.amount : trade.to.amount);
        }, 0);

        if (totalSoldUSD < totalBoughtUSD) {
          const lossAmount = totalBoughtUSD - totalSoldUSD;
          const averageBuyPrice = totalBoughtQuantity > 0 ? totalBoughtUSD / totalBoughtQuantity : 0;
          const averageSellPrice = totalSoldQuantity > 0 ? totalSoldUSD / totalSoldQuantity : 0;
          
          // Get the earliest buy date
          const earliestBuy = buys.reduce((earliest, trade) => 
            trade.time < earliest.time ? trade : earliest
          );

          tokenLosses.push({
            mint: tokenAddress,
            name: tokenInfo.name || 'Unknown Token',
            symbol: tokenInfo.symbol || 'UNKNOWN',
            lossAmount,
            buyPrice: averageBuyPrice,
            sellPrice: averageSellPrice,
            quantity: totalBoughtQuantity,
            date: new Date(earliestBuy.time).toISOString().split('T')[0],
            imageUrl: tokenInfo.image,
          });
        }
      }

      // Sort by loss amount (highest first)
      const sortedLosses = tokenLosses.sort((a, b) => b.lossAmount - a.lossAmount);
      
      console.log(`Calculated losses for ${sortedLosses.length} tokens from ${tradesData.trades.length} transactions`);
      
      return {
        losses: sortedLosses,
        totalTransactions: tradesData.trades.length,
        processedTransactions: tokenTradeMap.size
      };

    } catch (error) {
      console.error('Error fetching wallet token losses:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Wallet has no trading history.');
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your API key.');
        } else if (error.message.includes('500')) {
          throw new Error('API is experiencing issues. Please try again later.');
        }
      }
      
      throw new Error('Failed to fetch wallet data. Please try again later.');
    }
  }
}

export const solanaTracker = new SolanaTrackerService(); 