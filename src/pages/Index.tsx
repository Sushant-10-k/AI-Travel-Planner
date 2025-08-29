import SEO from "@/components/SEO";
import TripPlannerForm from "@/components/TripPlannerForm";
import TravelConcierge from "@/components/TravelConcierge";
import ItineraryPlannerAgent from "@/components/ItineraryPlannerAgent";
import FlightBookingAgent from "@/components/FlightBookingAgent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Calendar, Plane, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";
import Logo from "@/components/Logo";

// Define types for the multi-agent workflow
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
  days: any[];
  recommendations: any;
  alternatives: any;
}

type WorkflowStage = "input" | "itinerary" | "flights" | "complete";

const Index = () => {
  const title = "Plan My Trip — Your AI Travel Buddy";
  const description = "Share your route, dates, budget and traveler count — get a tailored itinerary instantly.";
  const [planningMethod, setPlanningMethod] = useState<'chat' | 'form'>('chat');
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('input');
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [selectedFlights, setSelectedFlights] = useState<any>(null);

  // Handler for when trip data is collected
  const handleTripDataCollected = (data: TripData) => {
    console.log('Trip data collected:', data);
    setTripData(data);
    setCurrentStage('itinerary');
  };

  // Handler for when itinerary is completed
  const handleItineraryComplete = (itineraryData: ItineraryPlan) => {
    console.log('Itinerary completed:', itineraryData);
    setItinerary(itineraryData);
    setCurrentStage('flights');
  };

  // Handler for when flights are selected
  const handleFlightsSelected = (flightData: any) => {
    console.log('Flights selected:', flightData);
    setSelectedFlights(flightData);
    setCurrentStage('complete');
  };

  // Handler to go back to previous stage
  const handleBack = () => {
    if (currentStage === 'flights') {
      setCurrentStage('itinerary');
    } else if (currentStage === 'itinerary') {
      setCurrentStage('input');
    }
  };

  // Progress indicator
  const getStageProgress = () => {
    const stages = ['input', 'itinerary', 'flights', 'complete'];
    return ((stages.indexOf(currentStage) + 1) / stages.length) * 100;
  };

  const getStageTitle = () => {
    const titles = {
      input: '1. Collect Trip Details',
      itinerary: '2. Create Itinerary',
      flights: '3. Book Flights',
      complete: '4. Complete!'
    };
    return titles[currentStage];
  };

  return (
    <>
      <SEO title={title} description={description} image={heroImage} />
      <header className="bg-hero animate-gradient-pan">
        <div className="container mx-auto py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="mb-6">
                <Logo size="lg" className="mb-4" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Your friendly AI travel buddy
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-prose">
                Experience our multi-agent AI system that guides you through every step of planning your perfect trip.
              </p>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="AI travel planner hero illustration with world landmarks"
                className="w-full h-auto rounded-lg shadow-elevated"
                decoding="async"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-12">
        {/* Progress Indicator */}
        {currentStage !== 'input' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{getStageTitle()}</h2>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Details
                </Badge>
                <Badge variant={currentStage === 'itinerary' ? 'default' : currentStage === 'flights' || currentStage === 'complete' ? 'secondary' : 'outline'}>
                  <Calendar className="w-3 h-3 mr-1" />
                  Itinerary
                </Badge>
                <Badge variant={currentStage === 'flights' ? 'default' : currentStage === 'complete' ? 'secondary' : 'outline'}>
                  <Plane className="w-3 h-3 mr-1" />
                  Flights
                </Badge>
                <Badge variant={currentStage === 'complete' ? 'default' : 'outline'}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              </div>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2 mb-6">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getStageProgress()}%` }}
              />
            </div>
          </div>
        )}

        {/* Stage 1: Input Collection */}
        {currentStage === 'input' && (
          <>
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-2xl font-bold text-center mb-6">How would you like to plan your trip?</h2>
              <div className="flex gap-4 mb-8">
                <Button
                  variant={planningMethod === 'chat' ? 'hero' : 'outline'}
                  size="lg"
                  onClick={() => setPlanningMethod('chat')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat with AI Concierge 🤖
                </Button>
                <Button
                  variant={planningMethod === 'form' ? 'hero' : 'outline'}
                  size="lg"
                  onClick={() => setPlanningMethod('form')}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Quick Form 📝
                </Button>
              </div>
            </div>

            {planningMethod === 'chat' ? (
              <TravelConcierge onDataCollected={handleTripDataCollected} />
            ) : (
              <TripPlannerForm onDataCollected={handleTripDataCollected} />
            )}
          </>
        )}

        {/* Stage 2: Itinerary Planning */}
        {currentStage === 'itinerary' && tripData && (
          <ItineraryPlannerAgent
            tripData={tripData}
            onComplete={handleItineraryComplete}
            onBack={handleBack}
          />
        )}

        {/* Stage 3: Flight Booking */}
        {currentStage === 'flights' && tripData && (
          <FlightBookingAgent
            tripData={tripData}
            onFlightSelected={handleFlightsSelected}
            onBack={handleBack}
          />
        )}

        {/* Stage 4: Complete */}
        {currentStage === 'complete' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold">Your Trip is Planned!</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Congratulations! Our multi-agent AI system has successfully planned your entire trip. 
              You now have a complete itinerary and flight options ready for your adventure!
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">📋 Detailed Itinerary</h3>
                <p className="text-sm text-muted-foreground">
                  Day-by-day plan with activities, times, and budget breakdown
                </p>
              </div>
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">✈️ Flight Options</h3>
                <p className="text-sm text-muted-foreground">
                  Curated flight selections that fit your schedule and budget
                </p>
              </div>
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">💡 Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Personalized suggestions for dining, activities, and local tips
                </p>
              </div>
            </div>

            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => window.location.reload()}
              className="animate-glow"
            >
              Plan Another Trip 🌟
            </Button>
          </div>
        )}
      </main>
    </>
  );
};

export default Index;
