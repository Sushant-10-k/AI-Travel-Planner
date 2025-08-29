import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  PieChart, 
  Calculator,
  Plane,
  Hotel,
  Utensils,
  MapPin,
  ShoppingBag,
  Car,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TripDetails {
  source: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  travelers: number;
  budget?: number;
  interests: string[];
}

interface ItineraryItem {
  day: number;
  date: string;
  theme: string;
  activities: Array<{
    time: string;
    title: string;
    description: string;
    location: string;
    estimatedCost: number;
    category: 'sightseeing' | 'food' | 'activity' | 'transport' | 'shopping';
  }>;
  accommodation?: {
    name: string;
    type: string;
    pricePerNight: number;
  };
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner';
    name: string;
    cost: number;
  }>;
}

interface FlightSelection {
  outbound: {
    price: { amount: number; currency: string };
  };
  return?: {
    price: { amount: number; currency: string };
  };
}

interface BudgetBreakdown {
  flights: {
    amount: number;
    percentage: number;
    details: string;
  };
  accommodation: {
    amount: number;
    percentage: number;
    details: string;
  };
  food: {
    amount: number;
    percentage: number;
    details: string;
  };
  activities: {
    amount: number;
    percentage: number;
    details: string;
  };
  transportation: {
    amount: number;
    percentage: number;
    details: string;
  };
  miscellaneous: {
    amount: number;
    percentage: number;
    details: string;
  };
}

interface BudgetAnalysis {
  totalEstimatedCost: number;
  userBudget?: number;
  budgetStatus: 'under' | 'over' | 'exact' | 'no-budget';
  budgetDifference?: number;
  breakdown: BudgetBreakdown;
  recommendations: string[];
  costPerPerson: number;
  currency: string;
  analysis: {
    highestCategory: keyof BudgetBreakdown;
    lowestCategory: keyof BudgetBreakdown;
    averageDailyCost: number;
    totalDays: number;
  };
}

interface Props {
  tripDetails: TripDetails;
  itinerary: ItineraryItem[];
  flightSelection?: FlightSelection;
  onAnalysisComplete: (analysis: BudgetAnalysis) => void;
  onBack: () => void;
}

export default function TravelBudgetAnalyst({ 
  tripDetails, 
  itinerary, 
  flightSelection,
  onAnalysisComplete,
  onBack 
}: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('initializing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);

  useEffect(() => {
    // Auto-start budget analysis when component mounts
    performBudgetAnalysis();
  }, []);

  const performBudgetAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const stages = [
      { name: 'initializing', message: 'Initializing budget analysis...', duration: 800 },
      { name: 'flights', message: 'Analyzing flight costs...', duration: 1000 },
      { name: 'accommodation', message: 'Calculating accommodation expenses...', duration: 1200 },
      { name: 'activities', message: 'Evaluating activity and attraction costs...', duration: 1500 },
      { name: 'food', message: 'Estimating meal and dining expenses...', duration: 1000 },
      { name: 'transport', message: 'Computing local transportation costs...', duration: 800 },
      { name: 'misc', message: 'Adding miscellaneous expenses...', duration: 600 },
      { name: 'analyzing', message: 'Performing comprehensive analysis...', duration: 1000 },
      { name: 'finalizing', message: 'Generating budget recommendations...', duration: 500 }
    ];

    try {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setAnalysisStage(stage.name);
        setAnalysisProgress(((i + 1) / stages.length) * 100);
        
        await new Promise(resolve => setTimeout(resolve, stage.duration));
      }

      // Perform actual budget analysis
      const analysis = await analyzeTripBudget(tripDetails, itinerary, flightSelection);
      setBudgetAnalysis(analysis);
      onAnalysisComplete(analysis);

      toast({
        title: "💰 Budget Analysis Complete!",
        description: `Estimated total cost: ${analysis.currency} ${analysis.totalEstimatedCost.toLocaleString()}`
      });

    } catch (error) {
      console.error('Budget analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete budget analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTripBudget = async (
    trip: TripDetails,
    itinerary: ItineraryItem[],
    flights?: FlightSelection
  ): Promise<BudgetAnalysis> => {
    
    // Calculate trip duration
    const startDate = new Date(trip.departureDate);
    const endDate = trip.returnDate ? new Date(trip.returnDate) : new Date(startDate.getTime() + (itinerary.length * 24 * 60 * 60 * 1000));
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // 1. Calculate flight costs
    let flightCost = 0;
    if (flights) {
      flightCost = flights.outbound.price.amount;
      if (flights.return) {
        flightCost += flights.return.price.amount;
      }
      flightCost *= trip.travelers; // Total for all travelers
    } else {
      // Estimate flight costs based on destination
      flightCost = estimateFlightCost(trip.source, trip.destination, trip.travelers, totalDays);
    }

    // 2. Calculate accommodation costs
    let accommodationCost = 0;
    if (itinerary.length > 0 && itinerary[0].accommodation) {
      // Use itinerary accommodation data
      accommodationCost = itinerary.reduce((total, day) => {
        return total + (day.accommodation?.pricePerNight || 0);
      }, 0);
    } else {
      // Estimate accommodation based on destination
      accommodationCost = estimateAccommodationCost(trip.destination, totalDays, trip.travelers);
    }

    // 3. Calculate food costs
    let foodCost = 0;
    if (itinerary.length > 0) {
      foodCost = itinerary.reduce((total, day) => {
        const dayFoodCost = day.meals.reduce((mealTotal, meal) => mealTotal + meal.cost, 0);
        return total + dayFoodCost;
      }, 0) * trip.travelers;
    } else {
      foodCost = estimateFoodCost(trip.destination, totalDays, trip.travelers);
    }

    // 4. Calculate activity costs
    let activityCost = 0;
    if (itinerary.length > 0) {
      activityCost = itinerary.reduce((total, day) => {
        const dayActivityCost = day.activities
          .filter(activity => activity.category === 'activity' || activity.category === 'sightseeing')
          .reduce((actTotal, activity) => actTotal + activity.estimatedCost, 0);
        return total + dayActivityCost;
      }, 0) * trip.travelers;
    } else {
      activityCost = estimateActivityCost(trip.destination, trip.interests, totalDays, trip.travelers);
    }

    // 5. Calculate transportation costs
    let transportCost = 0;
    if (itinerary.length > 0) {
      transportCost = itinerary.reduce((total, day) => {
        const dayTransportCost = day.activities
          .filter(activity => activity.category === 'transport')
          .reduce((transTotal, activity) => transTotal + activity.estimatedCost, 0);
        return total + dayTransportCost;
      }, 0) * trip.travelers;
    } else {
      transportCost = estimateTransportationCost(trip.destination, totalDays, trip.travelers);
    }

    // 6. Calculate miscellaneous costs (shopping, tips, emergency fund, etc.)
    let miscCost = 0;
    if (itinerary.length > 0) {
      miscCost = itinerary.reduce((total, day) => {
        const dayShoppingCost = day.activities
          .filter(activity => activity.category === 'shopping')
          .reduce((shopTotal, activity) => shopTotal + activity.estimatedCost, 0);
        return total + dayShoppingCost;
      }, 0) * trip.travelers;
      
      // Add 10% buffer for miscellaneous expenses
      miscCost += (flightCost + accommodationCost + foodCost + activityCost + transportCost) * 0.1;
    } else {
      miscCost = estimateMiscellaneousCost(trip.destination, totalDays, trip.travelers);
    }

    // Calculate totals
    const totalCost = flightCost + accommodationCost + foodCost + activityCost + transportCost + miscCost;

    // Create breakdown with percentages
    const breakdown: BudgetBreakdown = {
      flights: {
        amount: flightCost,
        percentage: (flightCost / totalCost) * 100,
        details: `Round-trip flights for ${trip.travelers} traveler(s)`
      },
      accommodation: {
        amount: accommodationCost,
        percentage: (accommodationCost / totalCost) * 100,
        details: `${totalDays} night(s) accommodation`
      },
      food: {
        amount: foodCost,
        percentage: (foodCost / totalCost) * 100,
        details: `Meals and dining for ${trip.travelers} person(s) over ${totalDays} days`
      },
      activities: {
        amount: activityCost,
        percentage: (activityCost / totalCost) * 100,
        details: `Attractions, tours, and entertainment`
      },
      transportation: {
        amount: transportCost,
        percentage: (transportCost / totalCost) * 100,
        details: `Local transport, taxis, and transfers`
      },
      miscellaneous: {
        amount: miscCost,
        percentage: (miscCost / totalCost) * 100,
        details: `Shopping, tips, and unexpected expenses`
      }
    };

    // Determine budget status
    let budgetStatus: 'under' | 'over' | 'exact' | 'no-budget' = 'no-budget';
    let budgetDifference: number | undefined;

    if (trip.budget) {
      const difference = Math.abs(totalCost - trip.budget);
      budgetDifference = totalCost - trip.budget;
      
      if (totalCost < trip.budget * 0.95) {
        budgetStatus = 'under';
      } else if (totalCost > trip.budget * 1.05) {
        budgetStatus = 'over';
      } else {
        budgetStatus = 'exact';
      }
    }

    // Find highest and lowest categories
    const categories = Object.keys(breakdown) as Array<keyof BudgetBreakdown>;
    const highestCategory = categories.reduce((prev, current) => 
      breakdown[prev].amount > breakdown[current].amount ? prev : current
    );
    const lowestCategory = categories.reduce((prev, current) => 
      breakdown[prev].amount < breakdown[current].amount ? prev : current
    );

    // Generate recommendations
    const recommendations = generateBudgetRecommendations(
      breakdown, 
      budgetStatus, 
      trip.destination,
      totalDays,
      trip.budget
    );

    return {
      totalEstimatedCost: Math.round(totalCost),
      userBudget: trip.budget,
      budgetStatus,
      budgetDifference,
      breakdown,
      recommendations,
      costPerPerson: Math.round(totalCost / trip.travelers),
      currency: 'USD',
      analysis: {
        highestCategory,
        lowestCategory,
        averageDailyCost: Math.round(totalCost / totalDays),
        totalDays
      }
    };
  };

  // Cost estimation functions for different categories
  const estimateFlightCost = (source: string, destination: string, travelers: number, days: number): number => {
    const baseRates: { [key: string]: number } = {
      'New York': 400, 'London': 600, 'Paris': 650, 'Tokyo': 800, 'Los Angeles': 350,
      'Chicago': 300, 'Dubai': 700, 'Singapore': 750, 'Frankfurt': 550, 'Amsterdam': 500
    };
    
    const baseCost = baseRates[destination] || 500;
    const multiplier = days > 7 ? 1.2 : days < 3 ? 0.8 : 1.0;
    return Math.round(baseCost * multiplier * travelers);
  };

  const estimateAccommodationCost = (destination: string, days: number, travelers: number): number => {
    const nightlyRates: { [key: string]: number } = {
      'New York': 200, 'London': 150, 'Paris': 180, 'Tokyo': 120, 'Los Angeles': 160,
      'Chicago': 140, 'Dubai': 250, 'Singapore': 130, 'Frankfurt': 110, 'Amsterdam': 120
    };
    
    const baseRate = nightlyRates[destination] || 150;
    const roomsNeeded = Math.ceil(travelers / 2); // Assuming 2 people per room
    return Math.round(baseRate * days * roomsNeeded);
  };

  const estimateFoodCost = (destination: string, days: number, travelers: number): number => {
    const dailyFoodRates: { [key: string]: number } = {
      'New York': 80, 'London': 70, 'Paris': 75, 'Tokyo': 60, 'Los Angeles': 70,
      'Chicago': 60, 'Dubai': 90, 'Singapore': 50, 'Frankfurt': 65, 'Amsterdam': 65
    };
    
    const dailyRate = dailyFoodRates[destination] || 70;
    return Math.round(dailyRate * days * travelers);
  };

  const estimateActivityCost = (destination: string, interests: string[], days: number, travelers: number): number => {
    const baseDailyActivity: { [key: string]: number } = {
      'New York': 60, 'London': 50, 'Paris': 55, 'Tokyo': 45, 'Los Angeles': 50,
      'Chicago': 40, 'Dubai': 70, 'Singapore': 40, 'Frankfurt': 35, 'Amsterdam': 40
    };
    
    const baseRate = baseDailyActivity[destination] || 50;
    const interestMultiplier = interests.length > 3 ? 1.3 : interests.length < 2 ? 0.7 : 1.0;
    return Math.round(baseRate * days * travelers * interestMultiplier);
  };

  const estimateTransportationCost = (destination: string, days: number, travelers: number): number => {
    const dailyTransportRates: { [key: string]: number } = {
      'New York': 25, 'London': 20, 'Paris': 18, 'Tokyo': 15, 'Los Angeles': 30,
      'Chicago': 20, 'Dubai': 35, 'Singapore': 12, 'Frankfurt': 15, 'Amsterdam': 12
    };
    
    const dailyRate = dailyTransportRates[destination] || 20;
    return Math.round(dailyRate * days * travelers);
  };

  const estimateMiscellaneousCost = (destination: string, days: number, travelers: number): number => {
    // 15-20% of total other costs for shopping, tips, emergencies
    const estimated = (estimateFlightCost('', destination, travelers, days) + 
                     estimateAccommodationCost(destination, days, travelers) + 
                     estimateFoodCost(destination, days, travelers) + 
                     estimateActivityCost(destination, [], days, travelers) + 
                     estimateTransportationCost(destination, days, travelers)) * 0.15;
    return Math.round(estimated);
  };

  const generateBudgetRecommendations = (
    breakdown: BudgetBreakdown,
    status: 'under' | 'over' | 'exact' | 'no-budget',
    destination: string,
    days: number,
    userBudget?: number
  ): string[] => {
    const recommendations: string[] = [];

    if (status === 'over' && userBudget) {
      recommendations.push(`💡 Budget exceeded by $${Math.round(breakdown.flights.amount + breakdown.accommodation.amount + breakdown.food.amount + breakdown.activities.amount + breakdown.transportation.amount + breakdown.miscellaneous.amount - userBudget).toLocaleString()}`);
      
      // Suggest cost-cutting measures based on highest categories
      const sortedCategories = Object.entries(breakdown)
        .sort(([,a], [,b]) => b.amount - a.amount)
        .slice(0, 3);

      sortedCategories.forEach(([category, data]) => {
        switch(category) {
          case 'flights':
            recommendations.push('✈️ Consider flexible dates or alternative airports to reduce flight costs');
            break;
          case 'accommodation':
            recommendations.push('🏨 Try hostels, Airbnb, or hotels in less central areas');
            break;
          case 'food':
            recommendations.push('🍽️ Mix restaurant meals with local markets and street food');
            break;
          case 'activities':
            recommendations.push('🎯 Prioritize must-see attractions and look for free activities');
            break;
          case 'transportation':
            recommendations.push('🚌 Use public transport instead of taxis and ride-shares');
            break;
        }
      });
    }

    if (status === 'under' && userBudget) {
      const surplus = userBudget - (breakdown.flights.amount + breakdown.accommodation.amount + breakdown.food.amount + breakdown.activities.amount + breakdown.transportation.amount + breakdown.miscellaneous.amount);
      recommendations.push(`🎉 You're under budget by $${Math.round(surplus).toLocaleString()}!`);
      recommendations.push('🌟 Consider upgrading accommodation or adding premium experiences');
      recommendations.push('🍾 Budget allows for some luxury dining or unique activities');
    }

    // General recommendations
    recommendations.push(`📊 ${Object.keys(breakdown).find(k => breakdown[k as keyof BudgetBreakdown].amount === Math.max(...Object.values(breakdown).map(v => v.amount)))} represents your largest expense category`);
    
    if (days >= 7) {
      recommendations.push('📅 Extended stay detected - consider weekly accommodation rates');
    }

    recommendations.push('💳 Keep 10-15% extra for unexpected expenses and currency fluctuations');
    
    return recommendations;
  };

  // Analysis stage messages
  const stageMessages = {
    initializing: "🔧 Setting up budget analysis framework...",
    flights: "✈️ Calculating flight costs and comparing prices...",
    accommodation: "🏨 Estimating lodging expenses based on your itinerary...",
    activities: "🎯 Evaluating costs for attractions and experiences...",
    food: "🍽️ Computing meal and dining budget requirements...",
    transport: "🚌 Analyzing local transportation and transfer costs...",
    misc: "🛍️ Adding shopping, tips, and miscellaneous expenses...",
    analyzing: "📊 Performing comprehensive cost analysis...",
    finalizing: "💡 Generating personalized budget recommendations..."
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-warm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Budget Analysis Agent 💰
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl mb-4">📊💰</div>
            <h3 className="text-2xl font-bold">Analyzing Trip Budget</h3>
            <p className="text-muted-foreground text-lg">
              Calculating comprehensive cost breakdown for your {tripDetails.destination} trip
            </p>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Destination:</span>
                <span className="font-medium">{tripDetails.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Travelers:</span>
                <span className="font-medium">{tripDetails.travelers}</span>
              </div>
              {tripDetails.budget && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><PieChart className="w-4 h-4" />Budget:</span>
                  <span className="font-medium">${tripDetails.budget.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Progress value={analysisProgress} className="h-3" />
              
              <p className="text-lg font-medium">
                {stageMessages[analysisStage as keyof typeof stageMessages]}
              </p>

              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetAnalysis) {
    const statusIcon = {
      under: <TrendingDown className="w-5 h-5 text-green-600" />,
      over: <TrendingUp className="w-5 h-5 text-red-600" />,
      exact: <CheckCircle className="w-5 h-5 text-blue-600" />,
      'no-budget': <Info className="w-5 h-5 text-gray-600" />
    };

    const statusMessage = {
      under: `Under budget by $${Math.abs(budgetAnalysis.budgetDifference || 0).toLocaleString()}`,
      over: `Over budget by $${Math.abs(budgetAnalysis.budgetDifference || 0).toLocaleString()}`,
      exact: 'Right on budget!',
      'no-budget': 'Budget analysis complete'
    };

    const statusColor = {
      under: 'text-green-600 bg-green-50 border-green-200',
      over: 'text-red-600 bg-red-50 border-red-200',
      exact: 'text-blue-600 bg-blue-50 border-blue-200',
      'no-budget': 'text-gray-600 bg-gray-50 border-gray-200'
    };

    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-warm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Budget Analysis Results 💰
            </CardTitle>
            <p className="text-white/80">
              Comprehensive cost breakdown for your {tripDetails.destination} trip
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">${budgetAnalysis.totalEstimatedCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">${budgetAnalysis.costPerPerson.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Cost Per Person</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">${budgetAnalysis.analysis.averageDailyCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Average Daily Cost</div>
              </div>
            </div>

            {budgetAnalysis.userBudget && (
              <div className={`mt-4 p-4 rounded-lg border flex items-center gap-2 ${statusColor[budgetAnalysis.budgetStatus]}`}>
                {statusIcon[budgetAnalysis.budgetStatus]}
                <span className="font-medium">{statusMessage[budgetAnalysis.budgetStatus]}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Breakdown */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {Object.entries(budgetAnalysis.breakdown).map(([category, data]) => {
                const icons = {
                  flights: <Plane className="w-5 h-5" />,
                  accommodation: <Hotel className="w-5 h-5" />,
                  food: <Utensils className="w-5 h-5" />,
                  activities: <MapPin className="w-5 h-5" />,
                  transportation: <Car className="w-5 h-5" />,
                  miscellaneous: <ShoppingBag className="w-5 h-5" />
                };

                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        {icons[category as keyof typeof icons]}
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">{category}</h4>
                        <p className="text-sm text-muted-foreground">{data.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${data.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{data.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Budget Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {budgetAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{recommendation}</p>
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
                ← Back to Itinerary
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Analysis complete • {budgetAnalysis.analysis.totalDays} days • {tripDetails.travelers} travelers
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Total: ${budgetAnalysis.totalEstimatedCost.toLocaleString()}
                </Badge>
              </div>

              <Button 
                variant="hero" 
                onClick={() => {
                  toast({
                    title: "💰 Budget Confirmed!",
                    description: "Your budget analysis has been saved."
                  });
                }}
                className="animate-glow"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Budget →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
