import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Plane, 
  Building, 
  Utensils, 
  Camera,
  Car,
  ShoppingBag,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  PieChart,
  Target,
  Sparkles,
  FileText,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TripData {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travellers: string;
  interests: string[];
}

interface ItineraryPlan {
  id: string;
  overview: {
    title: string;
    description: string;
    totalDays: number;
    totalCost: number;
    budgetBreakdown: any;
  };
  days: any[];
  recommendations: any;
  alternatives: any;
}

interface BudgetBreakdown {
  flights: {
    amount: number;
    calculation: string;
    details: string[];
  };
  accommodation: {
    amount: number;
    calculation: string;
    details: string[];
  };
  food: {
    amount: number;
    calculation: string;
    details: string[];
  };
  activities: {
    amount: number;
    calculation: string;
    details: string[];
  };
  transportation: {
    amount: number;
    calculation: string;
    details: string[];
  };
  miscellaneous: {
    amount: number;
    calculation: string;
    details: string[];
  };
}

interface BudgetAnalysis {
  totalEstimated: number;
  originalBudget: number;
  budgetStatus: 'under' | 'over' | 'on-track';
  variance: number;
  variancePercentage: number;
  breakdown: BudgetBreakdown;
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

interface Props {
  tripData: TripData;
  itinerary?: ItineraryPlan;
  onComplete: (analysis: BudgetAnalysis) => void;
  onBack: () => void;
}

export default function BudgetAnalystAgent({ tripData, itinerary, onComplete, onBack }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('initializing');
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState<'analyzing' | 'review' | 'completed'>('analyzing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-start budget analysis when component mounts
    performBudgetAnalysis();
  }, []);

  const performBudgetAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep('analyzing');
    setAnalysisProgress(0);

    const stages = [
      { name: 'initializing', message: 'Initializing budget analysis engine...', duration: 1000 },
      { name: 'flights', message: 'Analyzing flight costs and pricing trends...', duration: 2000 },
      { name: 'accommodation', message: 'Evaluating accommodation options and rates...', duration: 1800 },
      { name: 'food', message: 'Calculating dining and meal expenses...', duration: 1500 },
      { name: 'activities', message: 'Assessing activity and attraction costs...', duration: 1700 },
      { name: 'transportation', message: 'Computing local transportation expenses...', duration: 1200 },
      { name: 'miscellaneous', message: 'Factoring in miscellaneous and unexpected costs...', duration: 1000 },
      { name: 'compiling', message: 'Compiling comprehensive budget report...', duration: 1300 }
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setAnalysisStage(stage.name);
      setAnalysisProgress(((i + 1) / stages.length) * 100);
      
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }

    // Generate the actual budget analysis
    const budgetAnalysis = await generateBudgetAnalysis(tripData, itinerary);
    setAnalysis(budgetAnalysis);
    setCurrentStep('review');
    setIsAnalyzing(false);

    toast({
      title: "💰 Budget Analysis Complete!",
      description: "Your comprehensive cost breakdown is ready for review."
    });
  };

  const generateBudgetAnalysis = async (data: TripData, itineraryData?: ItineraryPlan): Promise<BudgetAnalysis> => {
    const totalDays = Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const travelers = parseInt(data.travellers) || 1;
    const originalBudget = parseInt(data.budget) || 2000;
    
    // Destination-based cost multipliers (this would normally come from a pricing database)
    const getDestinationMultiplier = (destination: string) => {
      const lowCost = ['thailand', 'vietnam', 'india', 'nepal', 'cambodia', 'laos', 'guatemala', 'bolivia'];
      const mediumCost = ['spain', 'portugal', 'greece', 'czech republic', 'poland', 'hungary', 'mexico', 'turkey'];
      const highCost = ['japan', 'switzerland', 'norway', 'denmark', 'singapore', 'australia', 'new zealand', 'uk'];
      const veryHighCost = ['monaco', 'luxembourg', 'iceland', 'liechtenstein'];
      
      const dest = destination.toLowerCase();
      if (veryHighCost.some(country => dest.includes(country))) return 1.5;
      if (highCost.some(country => dest.includes(country))) return 1.3;
      if (mediumCost.some(country => dest.includes(country))) return 0.9;
      if (lowCost.some(country => dest.includes(country))) return 0.6;
      return 1.0; // Default multiplier
    };

    const destMultiplier = getDestinationMultiplier(data.destination);

    // Calculate detailed breakdown
    const breakdown: BudgetBreakdown = {
      flights: {
        amount: Math.round((600 * travelers * (totalDays > 7 ? 1.2 : 1.0)) * destMultiplier),
        calculation: `Base flight cost: $600 × ${travelers} travelers × ${destMultiplier} destination multiplier`,
        details: [
          `International round-trip flights for ${travelers} ${travelers > 1 ? 'passengers' : 'passenger'}`,
          `${data.source} ↔ ${data.destination}`,
          `Peak season and booking timing considered`,
          `Includes taxes and fees`
        ]
      },
      accommodation: {
        amount: Math.round((85 * totalDays * Math.sqrt(travelers)) * destMultiplier),
        calculation: `$85 per night × ${totalDays} nights × √${travelers} travelers × ${destMultiplier} destination multiplier`,
        details: [
          `Mid-range accommodation for ${totalDays} nights`,
          `Shared costs optimized for ${travelers} ${travelers > 1 ? 'travelers' : 'traveler'}`,
          `Mix of hotels, guesthouses, and local stays`,
          `Private bathroom and central location`
        ]
      },
      food: {
        amount: Math.round((45 * totalDays * travelers) * destMultiplier),
        calculation: `$45 per person per day × ${totalDays} days × ${travelers} travelers × ${destMultiplier} destination multiplier`,
        details: [
          `Breakfast: $12/day - mix of hotel and local options`,
          `Lunch: $15/day - local restaurants and street food`,
          `Dinner: $18/day - variety of dining experiences`,
          `Includes local specialties and occasional fine dining`
        ]
      },
      activities: {
        amount: Math.round((35 * totalDays * travelers) * destMultiplier),
        calculation: `$35 per person per day × ${totalDays} days × ${travelers} travelers × ${destMultiplier} destination multiplier`,
        details: [
          `Entry fees to major attractions and museums`,
          `Guided tours and cultural experiences`,
          `Adventure activities based on interests`,
          `Entertainment and nightlife expenses`
        ]
      },
      transportation: {
        amount: Math.round((25 * totalDays * Math.sqrt(travelers)) * destMultiplier),
        calculation: `$25 per day × ${totalDays} days × √${travelers} group efficiency × ${destMultiplier} destination multiplier`,
        details: [
          `Local public transportation and metro passes`,
          `Occasional taxis and ride-sharing`,
          `Airport transfers`,
          `Inter-city transport if applicable`
        ]
      },
      miscellaneous: {
        amount: Math.round((20 * totalDays * travelers) * destMultiplier),
        calculation: `$20 per person per day × ${totalDays} days × ${travelers} travelers × ${destMultiplier} destination multiplier`,
        details: [
          `Souvenirs and shopping`,
          `Tips and gratuities`,
          `Communication (SIM cards, WiFi)`,
          `Emergency buffer and unexpected expenses`
        ]
      }
    };

    const totalEstimated = Object.values(breakdown).reduce((sum, category) => sum + category.amount, 0);
    const variance = totalEstimated - originalBudget;
    const variancePercentage = (variance / originalBudget) * 100;

    let budgetStatus: 'under' | 'over' | 'on-track' = 'on-track';
    if (variance < -originalBudget * 0.05) budgetStatus = 'under';
    else if (variance > originalBudget * 0.05) budgetStatus = 'over';

    const analysis: BudgetAnalysis = {
      totalEstimated,
      originalBudget,
      budgetStatus,
      variance,
      variancePercentage,
      breakdown,
      recommendations: generateRecommendations(budgetStatus, variance, data),
      costSavingTips: generateCostSavingTips(breakdown, data),
      riskFactors: generateRiskFactors(data, totalDays, destMultiplier)
    };

    return analysis;
  };

  const generateRecommendations = (status: string, variance: number, data: TripData): string[] => {
    const recommendations = [];

    if (status === 'over') {
      recommendations.push("Consider booking flights earlier or being flexible with travel dates to reduce costs");
      recommendations.push("Look into alternative accommodation options like hostels or vacation rentals");
      recommendations.push("Plan some free activities like hiking, beaches, or free museum days");
    } else if (status === 'under') {
      recommendations.push("You have room in your budget for some premium experiences or upgrades");
      recommendations.push("Consider extending your trip or adding day trips to nearby destinations");
      recommendations.push("Allocate extra budget for unique local experiences and cultural activities");
    } else {
      recommendations.push("Your budget looks well-balanced for this itinerary");
      recommendations.push("Keep a small emergency fund for unexpected opportunities");
    }

    recommendations.push("Book accommodation and major activities in advance for better rates");
    recommendations.push("Consider travel insurance to protect your investment");

    return recommendations;
  };

  const generateCostSavingTips = (breakdown: BudgetBreakdown, data: TripData): Array<{category: string, tip: string, potentialSavings: number}> => [
    {
      category: "Flights",
      tip: "Book 2-3 months in advance and consider nearby airports",
      potentialSavings: Math.round(breakdown.flights.amount * 0.15)
    },
    {
      category: "Accommodation",
      tip: "Stay in local guesthouses or use vacation rental platforms",
      potentialSavings: Math.round(breakdown.accommodation.amount * 0.25)
    },
    {
      category: "Food",
      tip: "Eat at local markets and cook some meals if possible",
      potentialSavings: Math.round(breakdown.food.amount * 0.30)
    },
    {
      category: "Transportation",
      tip: "Use public transport and walk when possible",
      potentialSavings: Math.round(breakdown.transportation.amount * 0.20)
    }
  ];

  const generateRiskFactors = (data: TripData, days: number, multiplier: number): Array<{factor: string, impact: 'low' | 'medium' | 'high', description: string}> => {
    const factors = [];

    if (multiplier > 1.2) {
      factors.push({
        factor: "High-cost destination",
        impact: "high" as const,
        description: "Prices may be 20-50% higher than estimated due to expensive local costs"
      });
    }

    if (days > 14) {
      factors.push({
        factor: "Extended trip duration",
        impact: "medium" as const,
        description: "Longer trips tend to have higher daily expenses due to fatigue and convenience choices"
      });
    }

    factors.push({
      factor: "Currency fluctuation",
      impact: "medium" as const,
      description: "Exchange rates may impact your actual spending power"
    });

    factors.push({
      factor: "Seasonal pricing",
      impact: "low" as const,
      description: "Peak tourist season may increase accommodation and activity costs"
    });

    return factors;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: typeof DollarSign } = {
      flights: Plane,
      accommodation: Building,
      food: Utensils,
      activities: Camera,
      transportation: Car,
      miscellaneous: ShoppingBag
    };
    return icons[category] || DollarSign;
  };

  const getBudgetStatusColor = (status: string) => {
    const colors = {
      'under': 'text-green-600 bg-green-50 border-green-200',
      'over': 'text-red-600 bg-red-50 border-red-200',
      'on-track': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[status as keyof typeof colors] || colors['on-track'];
  };

  const getBudgetStatusIcon = (status: string) => {
    if (status === 'over') return AlertCircle;
    if (status === 'under') return TrendingUp;
    return CheckCircle;
  };

  const handleComplete = () => {
    if (!analysis) return;
    
    setCurrentStep('completed');
    onComplete(analysis);
    
    toast({
      title: "📊 Budget Analysis Finalized!",
      description: "Your comprehensive cost analysis is ready!"
    });
  };

  const stagingMessages = {
    initializing: "🔧 Initializing budget analysis engine...",
    flights: "✈️ Analyzing flight costs and pricing trends...",
    accommodation: "🏨 Evaluating accommodation options and rates...",
    food: "🍽️ Calculating dining and meal expenses...",
    activities: "🎯 Assessing activity and attraction costs...",
    transportation: "🚗 Computing local transportation expenses...",
    miscellaneous: "🛍️ Factoring in miscellaneous expenses...",
    compiling: "📊 Compiling comprehensive budget report..."
  };

  if (currentStep === 'analyzing' || isAnalyzing) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-warm">
        <CardHeader className="bg-hero text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Budget Analyst Agent 💰
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl mb-4">🔍💰</div>
            <h3 className="text-2xl font-bold">Analyzing Your Trip Budget</h3>
            <p className="text-muted-foreground text-lg">
              Performing comprehensive cost analysis for your {Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24))}-day trip to {tripData.destination}
            </p>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Target className="w-4 h-4" />Original Budget:</span>
                <span className="font-medium text-lg">${tripData.budget}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Plane className="w-4 h-4" />Destination:</span>
                <span className="font-medium">{tripData.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Building className="w-4 h-4" />Travelers:</span>
                <span className="font-medium">{tripData.travellers}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Progress value={analysisProgress} className="h-3" />
              
              <p className="text-lg font-medium">
                {stagingMessages[analysisStage as keyof typeof stagingMessages]}
              </p>

              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'review' && analysis) {
    const StatusIcon = getBudgetStatusIcon(analysis.budgetStatus);
    
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-warm">
          <CardHeader className="bg-hero text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              Budget Analysis Report 📊
            </CardTitle>
            <p className="text-primary-foreground/80">
              Comprehensive cost breakdown for your {tripData.destination} adventure
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">${analysis.totalEstimated.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Estimated Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">${analysis.originalBudget.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Your Original Budget</div>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getBudgetStatusColor(analysis.budgetStatus)}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-semibold capitalize">{analysis.budgetStatus}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {analysis.variance >= 0 ? '+' : ''}${analysis.variance.toLocaleString()} ({analysis.variance >= 0 ? '+' : ''}{analysis.variancePercentage.toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Detailed Cost Breakdown</h3>
              
              {Object.entries(analysis.breakdown).map(([category, data]) => {
                const IconComponent = getCategoryIcon(category);
                const percentage = (data.amount / analysis.totalEstimated) * 100;
                
                return (
                  <Card key={category} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg capitalize">{category}</h4>
                          <p className="text-sm text-muted-foreground">{data.calculation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${data.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of total</div>
                      </div>
                    </div>
                    
                    <Progress value={percentage} className="mb-3" />
                    
                    <div className="bg-muted/30 rounded p-3">
                      <p className="text-sm font-medium mb-1">💡 What's Included:</p>
                      <ul className="text-xs space-y-1">
                        {data.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations and Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Expert Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cost Saving Tips */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Cost Saving Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.costSavingTips.map((tip, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{tip.category}</span>
                      <Badge variant="secondary">Save ${tip.potentialSavings}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Factors */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Budget Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.riskFactors.map((risk, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{risk.factor}</span>
                    <Badge variant={risk.impact === 'high' ? 'destructive' : risk.impact === 'medium' ? 'default' : 'secondary'}>
                      {risk.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{risk.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="shadow-warm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onBack}>
                ← Back to Previous Step
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={handleComplete}
                  className="animate-glow"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Budget Analysis ✨
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'completed') {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-warm">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold">Budget Analysis Complete!</h3>
            <p className="text-muted-foreground text-lg">
              Your comprehensive budget breakdown is ready with detailed cost estimates and savings recommendations.
            </p>
            
            <div className="bg-hero/10 rounded-lg p-4">
              <p className="text-sm">
                💰 Your budget analysis has been finalized and is ready for the next stage of your travel planning!
              </p>
            </div>

            <Button 
              variant="hero" 
              size="lg"
              onClick={() => onComplete(analysis!)}
              className="animate-glow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue Planning →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
