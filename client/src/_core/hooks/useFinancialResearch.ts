/**
 * Financial Research Hook
 * Provides access to financial research and stock analysis functionality
 */

import { useState, useCallback } from "react";
import { trpc } from "../trpc";

export interface StockAnalysisState {
  isLoading: boolean;
  symbol: string | null;
  analysis: string | null;
  error: string | null;
}

export interface PortfolioState {
  isLoading: boolean;
  recommendation: string | null;
  error: string | null;
}

export function useFinancialResearch() {
  const [analysisState, setAnalysisState] = useState<StockAnalysisState>({
    isLoading: false,
    symbol: null,
    analysis: null,
    error: null,
  });

  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    isLoading: false,
    recommendation: null,
    error: null,
  });

  // Query hooks
  const getStockQuoteQuery = trpc.financialResearch.getStockQuote.useQuery;
  const getHistoricalDataQuery = trpc.financialResearch.getHistoricalData.useQuery;
  const getFinancialStatementsQuery = trpc.financialResearch.getFinancialStatements.useQuery;
  const getCompanyProfileQuery = trpc.financialResearch.getCompanyProfile.useQuery;
  const getAnalystRecommendationsQuery = trpc.financialResearch.getAnalystRecommendations.useQuery;
  const getDividendInfoQuery = trpc.financialResearch.getDividendInfo.useQuery;
  const getKeyMetricsQuery = trpc.financialResearch.getKeyMetrics.useQuery;
  const analyzeStockPerformanceQuery = trpc.financialResearch.analyzeStockPerformance.useQuery;
  const getEarningsInfoQuery = trpc.financialResearch.getEarningsInfo.useQuery;
  const getStockNewsQuery = trpc.financialResearch.getStockNews.useQuery;
  const compareStocksQuery = trpc.financialResearch.compareStocks.useQuery;
  const screenStocksQuery = trpc.financialResearch.screenStocks.useQuery;

  // Mutation hooks
  const analyzeStockMutation = trpc.financialResearch.analyzeStock.useMutation;
  const compareStocksWithAnalysisMutation = trpc.financialResearch.compareStocksWithAnalysis.useMutation;
  const generatePortfolioRecommendationMutation = trpc.financialResearch.generatePortfolioRecommendation.useMutation;
  const findDividendOpportunitiesMutation = trpc.financialResearch.findDividendOpportunities.useMutation;
  const assessEarningsQualityMutation = trpc.financialResearch.assessEarningsQuality.useMutation;

  // Stock analysis
  const analyzeStock = useCallback(
    async (symbol: string, llmModel?: string) => {
      setAnalysisState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await analyzeStockMutation.mutateAsync({
          symbol,
          llmModel,
        });

        setAnalysisState((prev) => ({
          ...prev,
          isLoading: false,
          symbol: result.symbol,
          analysis: result.analysis,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Analysis failed";
        setAnalysisState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [analyzeStockMutation]
  );

  // Compare stocks
  const compareStocksWithAnalysis = useCallback(
    async (symbols: string[], llmModel?: string) => {
      setAnalysisState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await compareStocksWithAnalysisMutation.mutateAsync({
          symbols,
          llmModel,
        });

        setAnalysisState((prev) => ({
          ...prev,
          isLoading: false,
          analysis: result.analysis,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Comparison failed";
        setAnalysisState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [compareStocksWithAnalysisMutation]
  );

  // Generate portfolio recommendation
  const generatePortfolioRecommendation = useCallback(
    async (
      investmentAmount: number,
      riskTolerance: "Low" | "Medium" | "High",
      investmentHorizon: string,
      llmModel?: string
    ) => {
      setPortfolioState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await generatePortfolioRecommendationMutation.mutateAsync({
          investmentAmount,
          riskTolerance,
          investmentHorizon,
          llmModel,
        });

        setPortfolioState((prev) => ({
          ...prev,
          isLoading: false,
          recommendation: result.recommendation,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Portfolio generation failed";
        setPortfolioState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [generatePortfolioRecommendationMutation]
  );

  // Find dividend opportunities
  const findDividendOpportunities = useCallback(
    async (minYield: number, llmModel?: string) => {
      try {
        return await findDividendOpportunitiesMutation.mutateAsync({
          minYield,
          llmModel,
        });
      } catch (error) {
        throw error;
      }
    },
    [findDividendOpportunitiesMutation]
  );

  // Assess earnings quality
  const assessEarningsQuality = useCallback(
    async (symbol: string, llmModel?: string) => {
      try {
        return await assessEarningsQualityMutation.mutateAsync({
          symbol,
          llmModel,
        });
      } catch (error) {
        throw error;
      }
    },
    [assessEarningsQualityMutation]
  );

  // Get stock quote
  const getStockQuote = useCallback(
    (symbol: string) => {
      return getStockQuoteQuery({ symbol });
    },
    [getStockQuoteQuery]
  );

  // Get historical data
  const getHistoricalData = useCallback(
    (symbol: string, startDate: string, endDate: string, interval?: "1d" | "1wk" | "1mo") => {
      return getHistoricalDataQuery({
        symbol,
        startDate,
        endDate,
        interval,
      });
    },
    [getHistoricalDataQuery]
  );

  // Reset states
  const resetAnalysisState = useCallback(() => {
    setAnalysisState({
      isLoading: false,
      symbol: null,
      analysis: null,
      error: null,
    });
  }, []);

  const resetPortfolioState = useCallback(() => {
    setPortfolioState({
      isLoading: false,
      recommendation: null,
      error: null,
    });
  }, []);

  return {
    // States
    analysisState,
    portfolioState,

    // Analysis functions
    analyzeStock,
    compareStocksWithAnalysis,
    generatePortfolioRecommendation,
    findDividendOpportunities,
    assessEarningsQuality,

    // Data fetching
    getStockQuote,
    getHistoricalData,
    getFinancialStatementsQuery,
    getCompanyProfileQuery,
    getAnalystRecommendationsQuery,
    getDividendInfoQuery,
    getKeyMetricsQuery,
    analyzeStockPerformanceQuery,
    getEarningsInfoQuery,
    getStockNewsQuery,
    compareStocksQuery,
    screenStocksQuery,

    // Reset functions
    resetAnalysisState,
    resetPortfolioState,
  };
}
