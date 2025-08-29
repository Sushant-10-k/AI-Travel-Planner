import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Camera, 
  Utensils, 
  ShoppingBag, 
  Mountain,
  Waves,
  Building,
  TreePine,
  Sparkles,
  Users,
  DollarSign,
  Download,
  Share2,
  CheckCircle,
  Star,
  Info,
  Navigation,
  Heart
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

interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  category: string;
  priority: 'must-see' | 'recommended' | 'optional';
  bookingRequired: boolean;
  tips: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
  dailyBudget: number;
  totalCost: number;
  travelTime: string;
  highlights: string[];
}

interface ItineraryPlan {
  id: string;
  overview: {
    title: string;
    description: string;
    totalDays: number;
    totalCost: number;
    budgetBreakdown: {
      accommodation: number;
      food: number;
      activities: number;
      transport: number;
      shopping: number;
      emergency: number;
    };
    bestTimeToVisit: string;
    weatherTips: string[];
  };
  days: DayItinerary[];
  recommendations: {
    restaurants: Array<{ name: string; cuisine: string; priceRange: string; mustTry: string }>;
    accommodation: Array<{ name: string; type: string; location: string; priceRange: string; rating: number }>;
    transportation: Array<{ type: string; description: string; costEstimate: string; tips: string[] }>;
    shopping: Array<{ area: string; specialty: string; budgetTip: string }>;
    culturalTips: string[];
    packingList: string[];
  };
  alternatives: {
    badWeatherOptions: ItineraryActivity[];
    budgetFriendlySwaps: Array<{ original: string; alternative: string; savings: number }>;
    timeConstraintOptions: Array<{ scenario: string; adjustedPlan: string }>;
  };
}

interface Props {
  tripData: TripData;
  onComplete: (itinerary: ItineraryPlan) => void;
  onBack: () => void;
}

export default function ItineraryPlannerAgent({ tripData, onComplete, onBack }: Props) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStage, setPlanningStage] = useState('analyzing');
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [currentStep, setCurrentStep] = useState<'planning' | 'review' | 'customizing' | 'completed'>('planning');
  const [planningProgress, setPlanningProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-start itinerary planning when component mounts
    generateItinerary();
  }, []);

  const generateItinerary = async () => {
    setIsPlanning(true);
    setCurrentStep('planning');
    setPlanningProgress(0);

    const stages = [
      { name: 'analyzing', message: 'Analyzing your preferences and interests...', duration: 1500 },
      { name: 'researching', message: 'Researching top attractions and hidden gems...', duration: 2000 },
      { name: 'optimizing', message: 'Optimizing routes and timing for maximum enjoyment...', duration: 1800 },
      { name: 'budgeting', message: 'Creating budget-friendly options and alternatives...', duration: 1200 },
      { name: 'personalizing', message: 'Personalizing recommendations based on your interests...', duration: 1500 },
      { name: 'finalizing', message: 'Finalizing your dream itinerary...', duration: 1000 }
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setPlanningStage(stage.name);
      setPlanningProgress(((i + 1) / stages.length) * 100);
      
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }

    // Generate the actual itinerary
    const generatedItinerary = await createDetailedItinerary(tripData);
    setItinerary(generatedItinerary);
    setCurrentStep('review');
    setIsPlanning(false);

    toast({
      title: "🎉 Itinerary Ready!",
      description: "Your personalized travel plan has been created!"
    });
  };

  const createDetailedItinerary = async (data: TripData): Promise<ItineraryPlan> => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const budget = parseInt(data.budget) || 1000;
    const travelers = parseInt(data.travellers) || 1;

    // Mock detailed itinerary generation - replace with actual AI/API integration
    const itinerary: ItineraryPlan = {
      id: `itinerary_${Date.now()}`,
      overview: {
        title: `${totalDays}-Day Adventure in ${data.destination}`,
        description: `A carefully crafted ${totalDays}-day journey through ${data.destination}, perfectly tailored to your interests and budget. Experience the perfect blend of must-see attractions, local culture, and hidden gems.`,
        totalDays,
        totalCost: Math.floor(budget * 0.85), // Leave some buffer
        budgetBreakdown: {
          accommodation: Math.floor(budget * 0.35),
          food: Math.floor(budget * 0.25),
          activities: Math.floor(budget * 0.20),
          transport: Math.floor(budget * 0.15),
          shopping: Math.floor(budget * 0.03),
          emergency: Math.floor(budget * 0.02)
        },
        bestTimeToVisit: "Year-round destination with seasonal highlights",
        weatherTips: [
          "Pack layers for varying temperatures",
          "Check local weather before outdoor activities",
          "Bring rain jacket for unexpected showers"
        ]
      },
      days: generateDailyItineraries(data, totalDays, budget / totalDays),
      recommendations: {
        restaurants: [
          { name: "Local Flavor Bistro", cuisine: "Traditional", priceRange: "$15-25", mustTry: "Signature local dish" },
          { name: "Street Food Market", cuisine: "Various", priceRange: "$5-15", mustTry: "Local street specialties" },
          { name: "Rooftop Gardens", cuisine: "International", priceRange: "$25-40", mustTry: "Sunset dining experience" }
        ],
        accommodation: [
          { name: "Heritage Boutique Hotel", type: "Hotel", location: "City Center", priceRange: "$80-120", rating: 4.5 },
          { name: "Cozy Local Guesthouse", type: "Guesthouse", location: "Old Quarter", priceRange: "$40-70", rating: 4.2 },
          { name: "Modern Hostel", type: "Hostel", location: "Backpacker District", priceRange: "$20-35", rating: 4.0 }
        ],
        transportation: [
          { 
            type: "Local Metro", 
            description: "Efficient subway system", 
            costEstimate: "$2-5 per day", 
            tips: ["Buy daily passes for savings", "Avoid rush hours"] 
          },
          { 
            type: "Bike Rental", 
            description: "Explore at your own pace", 
            costEstimate: "$10-15 per day", 
            tips: ["Book through local apps", "Follow bike lane rules"] 
          }
        ],
        shopping: [
          { area: "Central Market", specialty: "Local crafts & souvenirs", budgetTip: "Haggle politely for better prices" },
          { area: "Artisan Quarter", specialty: "Handmade goods", budgetTip: "Visit during weekdays for less crowds" }
        ],
        culturalTips: [
          "Learn basic local greetings",
          "Respect local customs and dress codes",
          "Tip according to local standards",
          "Keep digital copies of important documents"
        ],
        packingList: [
          "Comfortable walking shoes",
          "Weather-appropriate clothing",
          "Portable charger",
          "First aid kit",
          "Local currency",
          "Camera or smartphone"
        ]
      },
      alternatives: {
        badWeatherOptions: [
          {
            id: "indoor_1",
            time: "10:00 AM",
            title: "Local History Museum",
            description: "Explore rich cultural heritage",
            location: "Museum District",
            duration: "2-3 hours",
            cost: 15,
            category: "culture",
            priority: "recommended",
            bookingRequired: false,
            tips: ["Audio guides available", "Student discounts offered"]
          }
        ],
        budgetFriendlySwaps: [
          { original: "Fine dining restaurant", alternative: "Local market food court", savings: 25 },
          { original: "Private tour guide", alternative: "Self-guided walking tour", savings: 40 }
        ],
        timeConstraintOptions: [
          { scenario: "Half day available", adjustedPlan: "Focus on top 3 must-see attractions" },
          { scenario: "Full day available", adjustedPlan: "Complete neighborhood exploration with lunch break" }
        ]
      }
    };

    return itinerary;
  };

  const generateDailyItineraries = (data: TripData, totalDays: number, dailyBudget: number): DayItinerary[] => {
    const days: DayItinerary[] = [];
    const startDate = new Date(data.startDate);

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayThemes = [
        "Arrival & City Overview",
        "Cultural Immersion",
        "Adventure & Nature",
        "Local Life & Markets",
        "Historical Exploration",
        "Relaxation & Leisure",
        "Departure Preparation"
      ];

      const activities = generateActivitiesForDay(i + 1, data.interests, dailyBudget);
      
      days.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        theme: dayThemes[Math.min(i, dayThemes.length - 1)],
        activities,
        dailyBudget,
        totalCost: activities.reduce((sum, act) => sum + act.cost, 0),
        travelTime: "30-60 minutes between locations",
        highlights: activities.filter(act => act.priority === 'must-see').map(act => act.title)
      });
    }

    return days;
  };

  const generateActivitiesForDay = (dayNumber: number, interests: string[], dailyBudget: number): ItineraryActivity[] => {
    const timeSlots = [
      { time: "9:00 AM", duration: "2 hours" },
      { time: "11:30 AM", duration: "1.5 hours" },
      { time: "1:00 PM", duration: "1 hour" },
      { time: "3:00 PM", duration: "2.5 hours" },
      { time: "6:30 PM", duration: "2 hours" }
    ];

    const activityTemplates = [
      {
        title: "Historic City Center Walking Tour",
        description: "Explore the heart of the city with centuries-old architecture and stories",
        location: "Old Town Square",
        category: "culture",
        baseCost: 0,
        priority: 'must-see' as const,
        tips: ["Wear comfortable shoes", "Bring water bottle", "Best lighting for photos in morning"]
      },
      {
        title: "Local Market Experience",
        description: "Immerse yourself in local flavors and vibrant market atmosphere",
        location: "Central Market",
        category: "food",
        baseCost: 20,
        priority: 'recommended' as const,
        tips: ["Try local specialties", "Bring small bills", "Market is busiest in mornings"]
      },
      {
        title: "Scenic Viewpoint Hike",
        description: "Breathtaking panoramic views of the city and surrounding landscape",
        location: "Sunset Hill",
        category: "nature",
        baseCost: 0,
        priority: 'must-see' as const,
        tips: ["Best visited during golden hour", "Bring camera", "Check weather conditions"]
      },
      {
        title: "Cultural Museum Visit",
        description: "Discover local art, history, and cultural treasures",
        location: "National Museum",
        category: "culture",
        baseCost: 15,
        priority: 'recommended' as const,
        tips: ["Audio guide recommended", "Student discounts available", "Free on first Sunday"]
      },
      {
        title: "Artisan Workshop Tour",
        description: "Watch local craftspeople create traditional handicrafts",
        location: "Artisan Quarter",
        category: "culture",
        baseCost: 25,
        priority: 'optional' as const,
        tips: ["Small groups preferred", "Photography allowed", "Can purchase directly from makers"]
      }
    ];

    return timeSlots.slice(0, Math.min(4, timeSlots.length)).map((slot, index) => {
      const template = activityTemplates[index % activityTemplates.length];
      return {
        id: `day_${dayNumber}_activity_${index + 1}`,
        time: slot.time,
        duration: slot.duration,
        cost: template.baseCost,
        bookingRequired: template.baseCost > 0,
        coordinates: {
          lat: 40.7128 + Math.random() * 0.1,
          lng: -74.0060 + Math.random() * 0.1
        },
        ...template
      };
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: typeof Camera } = {
      culture: Building,
      nature: TreePine,
      food: Utensils,
      shopping: ShoppingBag,
      adventure: Mountain,
      beach: Waves,
      sightseeing: Camera
    };
    return icons[category] || MapPin;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'must-see': 'bg-red-100 text-red-800 border-red-200',
      'recommended': 'bg-blue-100 text-blue-800 border-blue-200',
      'optional': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors.optional;
  };

  const handleComplete = () => {
    if (!itinerary) return;
    
    setCurrentStep('completed');
    onComplete(itinerary);
    
    toast({
      title: "🌟 Itinerary Finalized!",
      description: "Your personalized travel plan is ready to use!"
    });
  };

  const stagingMessages = {
    analyzing: "🔍 Analyzing your travel preferences and interests...",
    researching: "📚 Researching top attractions and hidden local gems...",
    optimizing: "🗺️ Optimizing routes and timing for the best experience...",
    budgeting: "💰 Creating budget-friendly options and alternatives...",
    personalizing: "✨ Personalizing recommendations just for you...",
    finalizing: "🎯 Finalizing your perfect itinerary..."
  };

  if (currentStep === 'planning' || isPlanning) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-warm">
        <CardHeader className="bg-hero text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Itinerary Planner Agent 🗓️
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl mb-4">🧭✨</div>
            <h3 className="text-2xl font-bold">Crafting Your Perfect Itinerary</h3>
            <p className="text-muted-foreground text-lg">
              Creating a detailed day-by-day plan for your {Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24))}-day adventure in {tripData.destination}
            </p>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Journey:</span>
                <span className="font-medium">{tripData.source} → {tripData.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Duration:</span>
                <span className="font-medium">{Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Users className="w-4 h-4" />Travelers:</span>
                <span className="font-medium">{tripData.travellers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget:</span>
                <span className="font-medium">${tripData.budget}</span>
              </div>
              {tripData.interests.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4" />Interests:</span>
                  <span className="font-medium">{tripData.interests.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${planningProgress}%` }}
                />
              </div>
              
              <p className="text-lg font-medium">
                {stagingMessages[planningStage as keyof typeof stagingMessages]}
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

  if (currentStep === 'review' && itinerary) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-warm">
          <CardHeader className="bg-hero text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {itinerary.overview.title} ✨
            </CardTitle>
            <p className="text-primary-foreground/80">{itinerary.overview.description}</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{itinerary.overview.totalDays}</div>
                <div className="text-sm text-muted-foreground">Days of Adventure</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">${itinerary.overview.totalCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{itinerary.days.flatMap(d => d.activities).filter(a => a.priority === 'must-see').length}</div>
                <div className="text-sm text-muted-foreground">Must-See Experiences</div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Accommodation:</span>
                  <span className="font-medium">${itinerary.overview.budgetBreakdown.accommodation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Food & Dining:</span>
                  <span className="font-medium">${itinerary.overview.budgetBreakdown.food}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activities:</span>
                  <span className="font-medium">${itinerary.overview.budgetBreakdown.activities}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation:</span>
                  <span className="font-medium">${itinerary.overview.budgetBreakdown.transport}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shopping:</span>
                  <span className="font-medium">${itinerary.overview.budgetBreakdown.shopping}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency:</span>
                  <span className="font-medium">${itinerary.overview.budgetBreakdown.emergency}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Itineraries */}
        <div className="space-y-4" ref={scrollRef}>
          {itinerary.days.map((day) => (
            <Card key={day.day} className="shadow-warm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary">Day {day.day}</Badge>
                      <span>{day.theme}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${day.totalCost}</div>
                    <div className="text-xs text-muted-foreground">Daily spend</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {day.activities.map((activity) => {
                    const IconComponent = getCategoryIcon(activity.category);
                    return (
                      <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{activity.time}</span>
                                  <span className="text-sm text-muted-foreground">({activity.duration})</span>
                                </div>
                                <h4 className="font-semibold text-lg">{activity.title}</h4>
                              </div>
                              <div className="text-right">
                                <Badge className={getPriorityColor(activity.priority)} variant="outline">
                                  {activity.priority}
                                </Badge>
                                {activity.cost > 0 && (
                                  <div className="text-sm font-medium mt-1">${activity.cost}</div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground mb-3">{activity.description}</p>
                            
                            <div className="flex items-center gap-4 mb-3 text-sm">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </span>
                              {activity.bookingRequired && (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <Info className="w-3 h-3" />
                                  Booking Required
                                </span>
                              )}
                            </div>

                            {activity.tips.length > 0 && (
                              <div className="bg-muted/30 rounded p-3">
                                <p className="text-sm font-medium mb-1">💡 Insider Tips:</p>
                                <ul className="text-xs space-y-1">
                                  {activity.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span>•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {day.highlights.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      Today's Highlights:
                    </p>
                    <p className="text-sm text-yellow-800">{day.highlights.join(' • ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <Card className="shadow-warm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onBack}>
                ← Back to Trip Details
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Itinerary
                </Button>
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={handleComplete}
                  className="animate-glow"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Itinerary ✨
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
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold">Itinerary Completed!</h3>
            <p className="text-muted-foreground text-lg">
              Your personalized {itinerary?.overview.totalDays}-day adventure plan is ready!
            </p>
            
            <div className="bg-hero/10 rounded-lg p-4">
              <p className="text-sm">
                🌟 Your itinerary has been finalized and is now ready for the next step in your travel planning journey!
              </p>
            </div>

            <Button 
              variant="hero" 
              size="lg"
              onClick={() => onComplete(itinerary!)}
              className="animate-glow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue to Next Agent →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
