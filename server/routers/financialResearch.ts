/**
 * Financial Research Router
 * Handles stock analysis and financial research operations
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { FinancialAnalystAgent } from "../_core/agents/financialAnalystAgent";
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
  compareStocks,
  screenStocks,
} from "../_core/agents/tools/yahooFinance";

export const financialResearchRouter = router({
  /**
   * Get stock quote and current metrics
   */
  getStockQuote: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getStockQuote(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch stock quote: ${error}`);
      }
    }),

  /**
   * Get historical stock data
   */
  getHistoricalData: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        interval: z.enum(["1d", "1wk", "1mo"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await getHistoricalData(
          input.symbol,
          new Date(input.startDate),
          new Date(input.endDate),
          input.interval || "1d"
        );
      } catch (error) {
        throw new Error(`Failed to fetch historical data: ${error}`);
      }
    }),

  /**
   * Get financial statements
   */
  getFinancialStatements: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        period: z.enum(["quarterly", "annual"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await getFinancialStatements(input.symbol, input.period || "annual");
      } catch (error) {
        throw new Error(`Failed to fetch financial statements: ${error}`);
      }
    }),

  /**
   * Get company profile
   */
  getCompanyProfile: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getCompanyProfile(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch company profile: ${error}`);
      }
    }),

  /**
   * Get analyst recommendations
   */
  getAnalystRecommendations: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getAnalystRecommendations(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch analyst recommendations: ${error}`);
      }
    }),

  /**
   * Get dividend information
   */
  getDividendInfo: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getDividendInfo(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch dividend info: ${error}`);
      }
    }),

  /**
   * Get key financial metrics
   */
  getKeyMetrics: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getKeyMetrics(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch key metrics: ${error}`);
      }
    }),

  /**
   * Analyze stock performance
   */
  analyzeStockPerformance: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await analyzeStockPerformance(input.symbol);
      } catch (error) {
        throw new Error(`Failed to analyze stock performance: ${error}`);
      }
    }),

  /**
   * Get earnings information
   */
  getEarningsInfo: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getEarningsInfo(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch earnings info: ${error}`);
      }
    }),

  /**
   * Get stock news
   */
  getStockNews: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      try {
        return await getStockNews(input.symbol);
      } catch (error) {
        throw new Error(`Failed to fetch stock news: ${error}`);
      }
    }),

  /**
   * Compare multiple stocks
   */
  compareStocks: protectedProcedure
    .input(z.object({ symbols: z.array(z.string()) }))
    .query(async ({ input }) => {
      try {
        return await compareStocks(input.symbols);
      } catch (error) {
        throw new Error(`Failed to compare stocks: ${error}`);
      }
    }),

  /**
   * Screen stocks based on criteria
   */
  screenStocks: protectedProcedure
    .input(
      z.object({
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minMarketCap: z.number().optional(),
        maxPeRatio: z.number().optional(),
        minDividendYield: z.number().optional(),
        sector: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await screenStocks(input);
      } catch (error) {
        throw new Error(`Failed to screen stocks: ${error}`);
      }
    }),

  /**
   * Analyze a single stock
   */
  analyzeStock: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        llmModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = new FinancialAnalystAgent(input.llmModel);
        const analysis = await agent.analyzeStock(input.symbol);
        return {
          symbol: input.symbol,
          analysis,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Failed to analyze stock: ${error}`);
      }
    }),

  /**
   * Compare stocks with AI analysis
   */
  compareStocksWithAnalysis: protectedProcedure
    .input(
      z.object({
        symbols: z.array(z.string()),
        llmModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = new FinancialAnalystAgent(input.llmModel);
        const analysis = await agent.compareStocks(input.symbols);
        return {
          symbols: input.symbols,
          analysis,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Failed to compare stocks: ${error}`);
      }
    }),

  /**
   * Generate portfolio recommendation
   */
  generatePortfolioRecommendation: protectedProcedure
    .input(
      z.object({
        investmentAmount: z.number(),
        riskTolerance: z.enum(["Low", "Medium", "High"]),
        investmentHorizon: z.string(),
        llmModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = new FinancialAnalystAgent(input.llmModel);
        const recommendation = await agent.generatePortfolioRecommendation(
          input.investmentAmount,
          input.riskTolerance,
          input.investmentHorizon
        );
        return {
          investmentAmount: input.investmentAmount,
          riskTolerance: input.riskTolerance,
          investmentHorizon: input.investmentHorizon,
          recommendation,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Failed to generate portfolio recommendation: ${error}`);
      }
    }),

  /**
   * Find dividend opportunities
   */
  findDividendOpportunities: protectedProcedure
    .input(
      z.object({
        minYield: z.number(),
        llmModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = new FinancialAnalystAgent(input.llmModel);
        const opportunities = await agent.findDividendOpportunities(input.minYield);
        return {
          minYield: input.minYield,
          opportunities,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Failed to find dividend opportunities: ${error}`);
      }
    }),

  /**
   * Assess earnings quality
   */
  assessEarningsQuality: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        llmModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agent = new FinancialAnalystAgent(input.llmModel);
        const assessment = await agent.assessEarningsQuality(input.symbol);
        return {
          symbol: input.symbol,
          assessment,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new Error(`Failed to assess earnings quality: ${error}`);
      }
    }),
});
