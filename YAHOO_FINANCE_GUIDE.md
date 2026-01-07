# Yahoo Finance Integration Guide

## Overview

This guide documents the integration of advanced Yahoo Finance tools into Agent-J, enabling comprehensive stock analysis, financial research, and investment decision-making capabilities.

## Features

### 1. Stock Data & Quotes
- Real-time stock prices and market data
- 52-week highs and lows
- Trading volume and market capitalization
- Key valuation metrics (P/E ratio, EPS, Beta)

### 2. Historical Data
- Daily, weekly, and monthly price data
- OHLC (Open, High, Low, Close) data
- Adjusted close prices
- Historical volume data

### 3. Financial Statements
- Income statements (annual and quarterly)
- Balance sheets
- Cash flow statements
- Key financial metrics

### 4. Company Information
- Company profiles and descriptions
- Sector and industry classification
- CEO and employee count
- Website and headquarters information

### 5. Analyst Research
- Analyst recommendations and ratings
- Price targets
- Consensus ratings
- Rating changes and trends

### 6. Dividend Analysis
- Dividend yield
- Annual dividend amounts
- Ex-dividend dates
- Payout ratios
- Dividend frequency

### 7. Performance Analysis
- Historical returns (1-month, 3-month, 6-month, 1-year)
- Volatility metrics
- Sharpe ratio
- Technical analysis (trend, support, resistance, RSI, MACD)

### 8. Earnings Information
- Historical earnings per share (EPS)
- Revenue data
- Earnings surprises
- Next earnings date
- Earnings history

### 9. Market News & Sentiment
- Recent news articles
- News sentiment analysis
- Source attribution
- Publication dates

### 10. Stock Screening
- Filter stocks by price range
- Market cap filters
- P/E ratio filters
- Dividend yield filters
- Sector-based screening

## Architecture

### Backend Components

#### Yahoo Finance Tool (`yahooFinance.ts`)
Core tool providing direct access to financial data:
- `getStockQuote()`: Fetch current stock prices
- `getHistoricalData()`: Retrieve historical price data
- `getFinancialStatements()`: Access financial statements
- `getCompanyProfile()`: Get company information
- `getAnalystRecommendations()`: Fetch analyst ratings
- `getDividendInfo()`: Get dividend information
- `getKeyMetrics()`: Retrieve financial ratios
- `analyzeStockPerformance()`: Performance analysis
- `getEarningsInfo()`: Earnings data
- `getStockNews()`: Market news
- `compareStocks()`: Compare multiple stocks
- `screenStocks()`: Screen stocks by criteria

#### Financial Analyst Agent (`financialAnalystAgent.ts`)
AI-powered agent for comprehensive financial analysis:
- `analyzeStock()`: Deep stock analysis
- `compareStocks()`: Multi-stock comparison
- `analyzeSectorTrends()`: Sector analysis
- `generatePortfolioRecommendation()`: Portfolio suggestions
- `findDividendOpportunities()`: Dividend investing
- `assessEarningsQuality()`: Earnings quality assessment

#### Financial Research Router (`financialResearch.ts`)
tRPC endpoints for financial operations:
- Query endpoints for data retrieval
- Mutation endpoints for AI analysis

### Frontend Components

#### useFinancialResearch Hook
React hook for financial research operations:
```typescript
const {
  analysisState,
  analyzeStock,
  compareStocksWithAnalysis,
  generatePortfolioRecommendation,
  getStockQuote,
  getHistoricalData,
  // ... more functions
} = useFinancialResearch();
```

## API Endpoints

### Query Endpoints (Data Retrieval)

**GET `/api/financialResearch.getStockQuote`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.getHistoricalData`**
```json
{
  "symbol": "AAPL",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "interval": "1d"
}
```

**GET `/api/financialResearch.getFinancialStatements`**
```json
{
  "symbol": "AAPL",
  "period": "annual"
}
```

**GET `/api/financialResearch.getCompanyProfile`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.getAnalystRecommendations`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.getDividendInfo`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.getKeyMetrics`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.analyzeStockPerformance`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.getEarningsInfo`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.getStockNews`**
```json
{
  "symbol": "AAPL"
}
```

**GET `/api/financialResearch.compareStocks`**
```json
{
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
```

**GET `/api/financialResearch.screenStocks`**
```json
{
  "minPrice": 50,
  "maxPrice": 500,
  "minMarketCap": 1000000000,
  "maxPeRatio": 30,
  "minDividendYield": 2,
  "sector": "Technology"
}
```

### Mutation Endpoints (AI Analysis)

**POST `/api/financialResearch.analyzeStock`**
```json
{
  "symbol": "AAPL",
  "llmModel": "gemini-2.5-flash"
}
```

**POST `/api/financialResearch.compareStocksWithAnalysis`**
```json
{
  "symbols": ["AAPL", "MSFT", "GOOGL"],
  "llmModel": "gemini-2.5-flash"
}
```

**POST `/api/financialResearch.generatePortfolioRecommendation`**
```json
{
  "investmentAmount": 100000,
  "riskTolerance": "Medium",
  "investmentHorizon": "10 years",
  "llmModel": "gemini-2.5-flash"
}
```

**POST `/api/financialResearch.findDividendOpportunities`**
```json
{
  "minYield": 3.5,
  "llmModel": "gemini-2.5-flash"
}
```

**POST `/api/financialResearch.assessEarningsQuality`**
```json
{
  "symbol": "AAPL",
  "llmModel": "gemini-2.5-flash"
}
```

## Usage Examples

### Backend Usage

```typescript
import { getStockQuote, analyzeStockPerformance } from './agents/tools/yahooFinance';

// Get stock quote
const quote = await getStockQuote('AAPL');
console.log(`AAPL: $${quote.price} (${quote.changePercent}%)`);

// Analyze performance
const analysis = await analyzeStockPerformance('AAPL');
console.log(`Trend: ${analysis.technicalAnalysis.trend}`);
```

### Frontend Usage

```typescript
import { useFinancialResearch } from '@/_core/hooks/useFinancialResearch';

function StockAnalyzer() {
  const { analyzeStock, analysisState } = useFinancialResearch();

  const handleAnalyze = async () => {
    await analyzeStock('AAPL');
  };

  return (
    <div>
      <button onClick={handleAnalyze}>Analyze AAPL</button>
      {analysisState.isLoading && <p>Analyzing...</p>}
      {analysisState.analysis && <pre>{analysisState.analysis}</pre>}
    </div>
  );
}
```

## Data Models

### StockQuote
```typescript
interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  averageVolume: number;
  peRatio: number;
  eps: number;
  beta: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayAverage: number;
  twoHundredDayAverage: number;
  timestamp: number;
}
```

### HistoricalData
```typescript
interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}
```

### FinancialStatement
```typescript
interface FinancialStatement {
  date: string;
  revenue: number;
  netIncome: number;
  operatingIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  stockholdersEquity: number;
  operatingCashFlow: number;
  freeCashFlow: number;
}
```

### KeyMetrics
```typescript
interface KeyMetrics {
  symbol: string;
  peRatio: number;
  pbRatio: number;
  priceToSalesRatio: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  profitMargin: number;
  operatingMargin: number;
}
```

## Implementation Notes

### Current Implementation
The current implementation uses placeholder data for demonstration. To use real Yahoo Finance data, integrate the `yahoo-finance2` npm package:

```bash
npm install yahoo-finance2
```

### Integration with yahoo-finance2
```typescript
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
const quote = await yahooFinance.quote('AAPL');
```

## Financial Analysis Capabilities

### Stock Analysis
- Valuation assessment (P/E, P/B, P/S ratios)
- Profitability analysis (ROE, ROA, margins)
- Financial health (debt ratios, liquidity ratios)
- Growth potential and trends

### Portfolio Recommendations
- Asset allocation strategies
- Risk-adjusted returns
- Diversification analysis
- Rebalancing suggestions

### Dividend Analysis
- Yield sustainability
- Payout ratio assessment
- Dividend growth trends
- Tax efficiency

### Sector Analysis
- Industry trends and drivers
- Competitive positioning
- Regulatory environment
- Growth opportunities

## Performance Considerations

### Rate Limiting
- Implement caching for frequently accessed data
- Use batch queries when possible
- Respect API rate limits

### Data Freshness
- Cache stock quotes for 5-15 minutes
- Update historical data daily
- Refresh financial statements quarterly

### Optimization
- Parallel requests for multiple stocks
- Lazy loading of detailed data
- Incremental data loading

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| Symbol not found | Invalid ticker symbol | Validate symbol before query |
| Rate limit exceeded | Too many requests | Implement caching and backoff |
| Data unavailable | Delisted or new stock | Handle gracefully with fallback |
| Network timeout | Connection issue | Implement retry logic |

## Future Enhancements

1. **Real-time Data**: WebSocket integration for live prices
2. **Advanced Analytics**: Machine learning for price prediction
3. **Portfolio Tracking**: User portfolio management
4. **Alerts**: Price and news alerts
5. **Export**: PDF and Excel report generation
6. **Mobile App**: Native mobile support
7. **Options Analysis**: Options pricing and Greeks
8. **Crypto Integration**: Cryptocurrency support

## References

- [Yahoo Finance](https://finance.yahoo.com/)
- [yahoo-finance2 npm package](https://www.npmjs.com/package/yahoo-finance2)
- [yahoo-finance2 GitHub](https://github.com/gadicc/yahoo-finance2)
- [Financial Ratios Guide](https://www.investopedia.com/financial-ratios-4689817)

## Support

For issues or questions about the Yahoo Finance integration:
1. Check the data models and API endpoints
2. Review error handling and logging
3. Verify API key configuration
4. Check rate limiting and caching
