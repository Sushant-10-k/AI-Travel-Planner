import { useState } from 'react';
import BudgetAnalystAgent from './BudgetAnalystAgent';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Example trip data for demonstration
const exampleTripData = {
  source: "New York",
  destination: "Tokyo, Japan",
  startDate: "2025-03-15",
  endDate: "2025-03-25",
  budget: "3500",
  travellers: "2",
  interests: ["culture", "food", "shopping", "nature"]
};

const exampleItinerary = {
  id: "itinerary_123",
  overview: {
    title: "10-Day Adventure in Tokyo, Japan",
    description: "Experience the perfect blend of traditional culture and modern innovation",
    totalDays: 10,
    totalCost: 3200,
    budgetBreakdown: {}
  },
  days: [],
  recommendations: {},
  alternatives: {}
};

interface BudgetAnalysis {
  totalEstimated: number;
  originalBudget: number;
  budgetStatus: 'under' | 'over' | 'on-track';
  variance: number;
  variancePercentage: number;
  breakdown: any;
  recommendations: string[];
  costSavingTips: Array<{
    category: string;
    tip: string;
    potentialSavings: number;
  }>;
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export default function BudgetAnalystDemo() {
  const [showAnalyst, setShowAnalyst] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BudgetAnalysis | null>(null);

  const handleAnalysisComplete = (analysis: BudgetAnalysis) => {
    setAnalysisResult(analysis);
    console.log('Budget Analysis Result:', analysis);
  };

  const handleBack = () => {
    setShowAnalyst(false);
    setAnalysisResult(null);
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  if (showAnalyst) {
    return (
      <BudgetAnalystAgent
        tripData={exampleTripData}
        itinerary={exampleItinerary}
        onComplete={handleAnalysisComplete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-warm">
        <CardHeader className="bg-hero text-primary-foreground">
          <CardTitle>Budget Analyst Agent Demo 💰</CardTitle>
          <p className="text-primary-foreground/80">
            Test the comprehensive travel budget analysis functionality
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Example Trip Details:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
                <div>
                  <p><strong>Route:</strong> {exampleTripData.source} → {exampleTripData.destination}</p>
                  <p><strong>Duration:</strong> {exampleTripData.startDate} to {exampleTripData.endDate}</p>
                  <p><strong>Travelers:</strong> {exampleTripData.travellers}</p>
                </div>
                <div>
                  <p><strong>Budget:</strong> ${exampleTripData.budget}</p>
                  <p><strong>Interests:</strong> {exampleTripData.interests.join(', ')}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">What the Budget Analyst Agent does:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✈️</span>
                  <span><strong>Flight Analysis:</strong> Estimates flight costs based on route, season, and booking patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🏨</span>
                  <span><strong>Accommodation Breakdown:</strong> Calculates lodging costs optimized for group size and destination</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🍽️</span>
                  <span><strong>Food & Dining:</strong> Estimates meal costs from street food to fine dining experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🎯</span>
                  <span><strong>Activities & Attractions:</strong> Budgets for entrance fees, tours, and entertainment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🚗</span>
                  <span><strong>Transportation:</strong> Local transport, transfers, and inter-city travel costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">🛍️</span>
                  <span><strong>Miscellaneous:</strong> Shopping, tips, communication, and emergency buffer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">💡</span>
                  <span><strong>Smart Recommendations:</strong> Cost-saving tips and budget optimization suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">⚠️</span>
                  <span><strong>Risk Assessment:</strong> Identifies potential budget risks and mitigation strategies</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={() => setShowAnalyst(true)}
              variant="hero" 
              size="lg" 
              className="w-full animate-glow"
            >
              🔍 Run Budget Analysis Demo
            </Button>

            {analysisResult && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Latest Analysis Summary:</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Estimated Total:</span>
                    <span className="font-semibold">{formatCurrency(analysisResult.totalEstimated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Original Budget:</span>
                    <span className="font-semibold">{formatCurrency(analysisResult.originalBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold capitalize ${
                      analysisResult.budgetStatus === 'over' ? 'text-red-600' :
                      analysisResult.budgetStatus === 'under' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {analysisResult.budgetStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variance:</span>
                    <span className={`font-semibold ${analysisResult.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {analysisResult.variance >= 0 ? '+' : ''}{formatCurrency(Math.abs(analysisResult.variance))}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Top Recommendation:</strong> {analysisResult.recommendations[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Biggest Savings Opportunity:</strong> {analysisResult.costSavingTips[0]?.tip} 
                      (Save {formatCurrency(analysisResult.costSavingTips[0]?.potentialSavings)})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
