from flask import request, Flask, jsonify
from flask_cors import CORS
from phi.agent import Agent, RunResponse
from phi.tools.yfinance import YFinanceTools
from pydantic import BaseModel, Field
from typing import List, Dict
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

def application(environ, start_response):
  if environ['REQUEST_METHOD'] == 'OPTIONS':
    start_response(
      '200 OK',
      [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Headers', 'Authorization, Content-Type'),
        ('Access-Control-Allow-Methods', 'POST'),
      ]
    )
    return ''
  
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:4321", "http://127.0.0.1:5000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

class HistoricalPrice(BaseModel):
    datevalue: str = Field(None, description="Date of the stock price. Use ISO 8601 to format this value.")
    price: float = Field(None, description="Closing price of the stock on that date")

class AnalystRecommendation(BaseModel):
    datevalue: str = Field(None, description="Date of the recommendation. Use ISO 8601 to format this value.")
    firm: str = Field(None, description="Name of the analyzing firm")
    recommendation: str = Field(None, description="Analyst recommendation (e.g., Buy, Sell, Hold)")
    target_price: float = Field(None, description="Price target if available")

class CompanyInfo(BaseModel):
    name: str = Field(None, description="Company name")
    sector: str = Field(None, description="Company sector")
    industry: str = Field(None, description="Company industry")
    country: str = Field(None, description="Company country")
    website: str = Field(None, description="Company website URL")
    business_summary: str = Field(None, description="Brief business summary")

class FinancialRatios(BaseModel):
    pe_ratio: float = Field(None, description="Price to Earnings Ratio")
    pb_ratio: float = Field(None, description="Price to Book Ratio")
    debt_to_equity: float = Field(None, description="Debt to Equity Ratio")
    current_ratio: float = Field(None, description="Current Ratio")
    profit_margin: float = Field(None, description="Profit Margin")
    roa: float = Field(None, description="Return on Assets")
    roe: float = Field(None, description="Return on Equity")

class IncomeStatement(BaseModel):
    year: int = Field(None, description="Year of the income statement")
    total_revenue: float
    gross_profit: float
    operating_income: float
    net_income: float
    eps: float

class StockAnalysis(BaseModel):
    current_price: float = Field(..., description="Current stock price")
    company_info: CompanyInfo = Field(..., description="Detailed company information")
    historical_prices: List[HistoricalPrice] = Field(..., description="Stock prices for last 10 days, Add old day data at top and newest day data at last")
    analyst_recommendations: List[AnalystRecommendation] = Field(..., description="Analyst recommendations for last 3 months")
    financial_ratios: FinancialRatios = Field(..., description="Key financial ratios")
    income_statements: List[IncomeStatement] = Field(..., description="Income statements for last 3 years, Add old day data at top and newest day data at last")

class StockAnalysisResponse(BaseModel):
    stock_analysis: StockAnalysis = Field(..., description="Comprehensive stock analysis data")

class StockRequest(BaseModel):
    symbol: str = Field(None, description="Stock symbol to analyze")

financeAgent = Agent(
    tools=[YFinanceTools(
        company_info=True,
        stock_price=True,
        historical_prices=True,
        analyst_recommendations=True,
        stock_fundamentals=True,
        income_statements=True,
        key_financial_ratios=True
    )],
    show_tool_calls=True,
    description="You are an investment analyst that researches stock prices, analyst recommendations, stock fundamentals, and financial statements",
    instructions=["Format your response using markdown and use tables to display data where possible, In listing data always provide latest data as top in list like stock price, income statements."],
    response_model=StockAnalysisResponse,
    structured_outputs=True,
)

def get_stock_analysis(stock_symbol: str):
    try:
        structured_output_response: RunResponse = financeAgent.run(f"Provide comprehensive analysis for {stock_symbol} stock including current price, company info, historical prices, analyst recommendations, financial ratios, and income statements")
        return structured_output_response.content
    except Exception as e:
        raise Exception(f"Error analyzing stock {stock_symbol}: {str(e)}")

@app.route('/')
def hello_world():
    return 'Hello World'

@app.route("/stock-analysis", methods=["POST", 'OPTIONS'])
def analyze_stock():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        request_data = request.get_json()
        symbol = request_data.get('symbol')
        if not symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
            
        analysis_result = get_stock_analysis(symbol)
        return json.loads(json.dumps(analysis_result, default=lambda o: o.__dict__))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    app.run(debug=True)