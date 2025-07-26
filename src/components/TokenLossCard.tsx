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

interface TokenLossCardProps {
  loss: TokenLoss;
  chemoCost: number;
}

export default function TokenLossCard({ loss, chemoCost }: TokenLossCardProps) {
  const chemoSessions = Math.floor(loss.lossAmount / chemoCost);
  const percentageLoss = loss.buyPrice > 0 ? ((loss.buyPrice - loss.sellPrice) / loss.buyPrice) * 100 : 0;

  // Format numbers appropriately based on size
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(8)}`;
    }
  };

  const formatQuantity = (quantity: number) => {
    if (quantity >= 1000000000) {
      return `${(quantity / 1000000000).toFixed(2)}B`;
    } else if (quantity >= 1000000) {
      return `${(quantity / 1000000).toFixed(2)}M`;
    } else if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)}K`;
    } else {
      return quantity.toLocaleString();
    }
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {loss.imageUrl && (
            <img 
              src={loss.imageUrl} 
              alt={loss.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h3 className="text-xl font-bold text-black">{loss.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600">{loss.symbol}</p>
              {loss.mint && (
                <p className="text-xs text-gray-400 font-mono">
                  {loss.mint.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">
            -${loss.lossAmount.toLocaleString()}
          </div>
          <div className="text-sm text-red-500">
            -{percentageLoss.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Buy Price:</span>
          <div className="font-semibold">{formatPrice(loss.buyPrice)}</div>
        </div>
        <div>
          <span className="text-gray-600">Sell Price:</span>
          <div className="font-semibold">{formatPrice(loss.sellPrice)}</div>
        </div>
        <div>
          <span className="text-gray-600">Quantity:</span>
          <div className="font-semibold">{formatQuantity(loss.quantity)}</div>
        </div>
        <div>
          <span className="text-gray-600">Date:</span>
          <div className="font-semibold">{loss.date}</div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Chemo sessions lost:</span>
          <div className="flex items-center">
            <span className="text-lg font-bold text-green-600 mr-2">
              {chemoSessions}
            </span>
            <span className="text-sm text-gray-500">sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
} 