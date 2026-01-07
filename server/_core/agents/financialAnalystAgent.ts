/**
 * Financial Analyst Agent
 * Specialized agent for stock analysis and financial research
 */

import { BaseAgent } from "./baseAgent";
import {
  getStockQuote,
  getHistoricalData,
  getFinancialStatements,
  getCompanyProfile,
  getAnalystRecommendations,
  getDividendInfo,
  getKeyMetrics,
  analyzeStockPerformance,
  getEarningsInfo,
  getStockNews,
} from "./tools/yahooFinance";
import { AgentTask } from "./types";

export class FinancialAnalystAgent extends BaseAgent {
  constructor(model: string = "gemini-2.5-flash") {
    super("financial_analyst", model);
    this.maxTokens = 12288;
    this.temperature = 0.3; // Lower temperature for more consistent analysis
    this.systemPrompt = `You are an expert financial analyst. Your role is to:
1. Analyze stock prices and market trends
2. Evaluate company fundamentals and financial health
3. Provide investment recommendations based on data
4. Identify risks and opportunities
5. Compare companies within the same sector
6. Assess valuation metrics and growth potential

Use available financial data to provide comprehensive, data-driven analysis.
Always cite specific metrics and ratios in your analysis.
Provide clear recommendations with risk assessments.`;
  }

  /**
   * Analyze a single stock
   */
  async analyzeStock(symbol: string): Promise<string> {
    try {
      // Gather comprehensive stock data
      const quote = await getStockQuote(symbol);
      const profile = await getCompanyProfile(symbol);
      const metrics = await getKeyMetrics(symbol);
      const analyst = await getAnalystRecommendations(symbol);
      const performance = await analyzeStockPerformance(symbol);
      const earnings = await getEarningsInfo(symbol);
      const news = await getStockNews(symbol);

      // Build analysis message
      const analysisPrompt = `
Analyze the following stock data for ${symbol}:

Current Quote:
- Price: $${quote.price} (${quote.changePercent > 0 ? "+" : ""}${quote.changePercent}%)
- Market Cap: $${(quote.marketCap / 1e12).toFixed(2)}T
- P/E Ratio: ${quote.peRatio}
- 52-Week Range: $${quote.fiftyTwoWeekLow} - $${quote.fiftyTwoWeekHigh}

Company Profile:
- Name: ${profile.name}
- Sector: ${profile.sector}
- Industry: ${profile.industry}
- Employees: ${profile.employees}

Key Metrics:
- ROE: ${metrics.roe}%
- Debt-to-Equity: ${metrics.debtToEquity}
- Profit Margin: ${metrics.profitMargin}%
- Current Ratio: ${metrics.currentRatio}

Performance Analysis:
- Trend: ${performance.technicalAnalysis.trend}
- 1-Year Return: ${performance.performanceMetrics.oneYearReturn}%
- Volatility: ${performance.performanceMetrics.volatility}%
- Sharpe Ratio: ${performance.performanceMetrics.sharpeRatio}

Analyst Consensus:
- Target Price: $${analyst.targetPrice}
- Rating: ${analyst.rating}
- Number of Analysts: ${analyst.numberOfAnalysts}

Recent Earnings:
- Last EPS: $${earnings.lastEarningsPerShare}
- Next Earnings: ${earnings.nextEarningsDate}

Recent News Sentiment: ${news.map((n) => n.sentiment).join(", ")}

Provide a comprehensive analysis including:
1. Investment thesis
2. Key strengths and weaknesses
3. Valuation assessment
4. Risk factors
5. Price target and recommendation`;

      // Execute analysis through LLM
      const task: AgentTask = {
        id: `analysis-${symbol}-${Date.now()}`,
        description: analysisPrompt,
        context: { symbol },
      };

      const result = await this.execute(task);
      return result.output;
    } catch (error) {
      throw new Error(`Failed to analyze stock ${symbol}: ${error}`);
    }
  }

  /**
   * Compare multiple stocks
   */
  async compareStocks(symbols: string[]): Promise<string> {
    try {
      const quotes = await Promise.all(symbols.map((s) => getStockQuote(s)));
      const metrics = await Promise.all(symbols.map((s) => getKeyMetrics(s)));

      const comparisonData = symbols.map((symbol, index) => ({
        symbol,
        price: quotes[index].price,
        peRatio: metrics[index].peRatio,
        roe: metrics[index].roe,
        debtToEquity: metrics[index].debtToEquity,
        profitMargin: metrics[index].profitMargin,
      }));

      const comparisonPrompt = `
Compare the following stocks:

${comparisonData
  .map(
    (data) => `
${data.symbol}:
- Price: $${data.price}
- P/E Ratio: ${data.peRatio}
- ROE: ${data.roe}%
- Debt-to-Equity: ${data.debtToEquity}
- Profit Margin: ${data.profitMargin}%`
  )
  .join("\n")}

Provide a detailed comparison including:
1. Relative valuation
2. Profitability comparison
3. Financial health assessment
4. Growth potential
5. Investment recommendation ranking`;

      const task: AgentTask = {
        id: `comparison-${symbols.join("-")}-${Date.now()}`,
        description: comparisonPrompt,
        context: { symbols },
      };

      const result = await this.execute(task);
      return result.output;
    } catch (error) {
      throw new Error(`Failed to compare stocks: ${error}`);
    }
  }

  /**
   * Analyze sector trends
   */
  async analyzeSectorTrends(sector: string, symbols: string[]): Promise<string> {
    try {
      const sectorAnalysisPrompt = `
Analyze trends in the ${sector} sector based on the following stocks: ${symbols.join(", ")}

Provide analysis on:
1. Sector growth trajectory
2. Key drivers and headwinds
3. Competitive landscape
4. Regulatory environment
5. Investment opportunities within the sector
6. Risk factors specific to the sector`;

      const task: AgentTask = {
        id: `sector-analysis-${sector}-${Date.now()}`,
        description: sectorAnalysisPrompt,
        context: { sector, symbols },
      };

      const result = await this.execute(task);
      return result.output;
    } catch (error) {
      throw new Error(`Failed to analyze sector trends: ${error}`);
    }
  }

  /**
   * Generate investment portfolio recommendation
   */
  async generatePortfolioRecommendation(
    investmentAmount: number,
    riskTolerance: "Low" | "Medium" | "High",
    investmentHorizon: string
  ): Promise<string> {
    try {
      const portfolioPrompt = `
Generate a portfolio recommendation with the following parameters:
- Investment Amount: $${investmentAmount}
- Risk Tolerance: ${riskTolerance}
- Investment Horizon: ${investmentHorizon}

Provide:
1. Asset allocation strategy
2. Specific stock recommendations with allocation percentages
3. Diversification rationale
4. Expected returns and risk metrics
5. Rebalancing strategy
6. Alternative investment options`;

      const task: AgentTask = {
        id: `portfolio-${Date.now()}`,
        description: portfolioPrompt,
        context: { investmentAmount, riskTolerance, investmentHorizon },
      };

      const result = await this.execute(task);
      return result.output;
    } catch (error) {
      throw new Error(`Failed to generate portfolio recommendation: ${error}`);
    }
  }

  /**
   * Identify dividend opportunities
   */
  async findDividendOpportunities(minYield: number): Promise<string> {
    try {
      const dividendPrompt = `
Identify dividend investment opportunities with minimum yield of ${minYield}%:

Analyze:
1. High-yield dividend stocks
2. Dividend growth potential
3. Payout ratio sustainability
4. Dividend safety assessment
5. Tax efficiency considerations
6. Sector diversification in dividend portfolio`;

      const task: AgentTask = {
        id: `dividend-search-${Date.now()}`,
        description: dividendPrompt,
        context: { minYield },
      };

      const result = await this.execute(task);
      return result.output;
    } catch (error) {
      throw new Error(`Failed to find dividend opportunities: ${error}`);
    }
  }

  /**
   * Assess earnings quality
   */
  async assessEarningsQuality(symbol: string): Promise<string> {
    try {
      const earnings = await getEarningsInfo(symbol);
      const statements = await getFinancialStatements(symbol, "annual");

      const earningsQualityPrompt = `
Assess the earnings quality for ${symbol}:

Earnings History:
${earnings.earningsHistory
  .map((e) => `- ${e.date}: EPS $${e.eps}, Revenue $${e.revenue}, Surprise ${e.surprise}%`)
  .join("\n")}

Financial Statements:
${statements
  .map(
    (s) => `
- Date: ${s.date}
- Operating Cash Flow: $${s.operatingCashFlow}
- Free Cash Flow: $${s.freeCashFlow}
- Net Income: $${s.netIncome}`
  )
  .join("\n")}

Evaluate:
1. Earnings consistency and predictability
2. Cash flow quality
3. Accrual patterns
4. Revenue growth sustainability
5. One-time items and adjustments
6. Overall earnings quality rating`;

      const task: AgentTask = {
        id: `earnings-quality-${symbol}-${Date.now()}`,
        description: earningsQualityPrompt,
        context: { symbol },
      };

      const result = await this.execute(task);
      return result.output;
    } catch (error) {
      throw new Error(`Failed to assess earnings quality: ${error}`);
    }
  }

  getTools() {
    // Return financial analysis tools
    return [];
  }

  buildMessages() {
    return [];
  }
}
