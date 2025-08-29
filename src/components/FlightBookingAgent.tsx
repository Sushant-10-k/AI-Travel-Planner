import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Clock, DollarSign, Users, Calendar, MapPin, Star, Zap, Shield, Sparkles } from "lucide-react";
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

interface FlightOption {
  id: string;
  airline: string;
  airlineCode: string;
  price: number;
  duration: string;
  stops: number;
  departureTime: string;
  arrivalTime: string;
  aircraft: string;
  bookingClass: string;
  seatsAvailable: number;
  carbonFootprint: string;
  amenities: string[];
  provider: string;
  deepLink: string;
  priceBreakdown: {
    baseFare: number;
    taxes: number;
    fees: number;
  };
  baggage: {
    carry: string;
    checked: string;
  };
  cancellation: string;
  rating: number;
}

interface FlightSearchResult {
  outbound: FlightOption[];
  return?: FlightOption[];
  searchId: string;
  totalResults: number;
  currency: string;
  lastUpdated: string;
}

interface Props {
  tripData: TripData;
  onFlightSelected: (flights: { outbound: FlightOption; return?: FlightOption }) => void;
  onBack: () => void;
}

export default function FlightBookingAgent({ tripData, onFlightSelected, onBack }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FlightSearchResult | null>(null);
  const [selectedOutbound, setSelectedOutbound] = useState<FlightOption | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<FlightOption | null>(null);
  const [currentStep, setCurrentStep] = useState<'searching' | 'selecting' | 'confirming'>('searching');

  useEffect(() => {
    // Auto-start flight search when component mounts
    searchFlights();
  }, []);

  const searchFlights = async () => {
    setIsSearching(true);
    setCurrentStep('searching');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock flight data - replace with actual API integration
      const mockResults: FlightSearchResult = {
        outbound: generateMockFlights('outbound'),
        return: tripData.startDate !== tripData.endDate ? generateMockFlights('return') : undefined,
        searchId: `search_${Date.now()}`,
        totalResults: 156,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      };

      setSearchResults(mockResults);
      setCurrentStep('selecting');

      toast({
        title: "✈️ Flights Found!",
        description: `Found ${mockResults.totalResults} flight options for your journey!`
      });

    } catch (error) {
      console.error('Flight search failed:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search flights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateMockFlights = (type: 'outbound' | 'return'): FlightOption[] => {
    const airlines = [
      { name: 'Delta Airlines', code: 'DL', rating: 4.2 },
      { name: 'American Airlines', code: 'AA', rating: 4.0 },
      { name: 'United Airlines', code: 'UA', rating: 4.1 },
      { name: 'JetBlue Airways', code: 'B6', rating: 4.3 },
      { name: 'Southwest Airlines', code: 'WN', rating: 4.4 }
    ];

    return airlines.slice(0, 3).map((airline, index) => {
      const basePrice = parseInt(tripData.budget) ? 
        Math.floor(parseInt(tripData.budget) * 0.3) + (index * 50) : 
        300 + (index * 100);
      
      const stops = index === 0 ? 0 : index === 1 ? 1 : 2;
      const duration = index === 0 ? '8h 30m' : index === 1 ? '12h 15m' : '16h 45m';
      
      return {
        id: `${type}_${airline.code}_${index}`,
        airline: airline.name,
        airlineCode: airline.code,
        price: basePrice,
        duration,
        stops,
        departureTime: type === 'outbound' ? '10:30 AM' : '2:15 PM',
        arrivalTime: type === 'outbound' ? '7:00 PM' : '8:30 AM',
        aircraft: 'Boeing 737-800',
        bookingClass: index === 0 ? 'Economy Plus' : 'Economy',
        seatsAvailable: Math.floor(Math.random() * 20) + 5,
        carbonFootprint: `${0.2 + (index * 0.1)} tons CO₂`,
        amenities: index === 0 ? 
          ['Wi-Fi', 'Power outlets', 'In-flight entertainment', 'Complimentary snacks'] :
          index === 1 ? 
          ['Wi-Fi', 'In-flight entertainment'] :
          ['Basic seating'],
        provider: 'Skyscanner',
        deepLink: `https://skyscanner.com/book/${airline.code}`,
        priceBreakdown: {
          baseFare: Math.floor(basePrice * 0.7),
          taxes: Math.floor(basePrice * 0.2),
          fees: Math.floor(basePrice * 0.1)
        },
        baggage: {
          carry: '1 personal item + 1 carry-on',
          checked: index === 0 ? '1 bag included' : '$30 per bag'
        },
        cancellation: index === 0 ? '24hr free cancellation' : 'Non-refundable',
        rating: airline.rating
      };
    });
  };

  const handleFlightSelection = (flight: FlightOption, type: 'outbound' | 'return') => {
    if (type === 'outbound') {
      setSelectedOutbound(flight);
    } else {
      setSelectedReturn(flight);
    }

    // Auto-proceed if both flights are selected (for round trip) or just outbound (for one-way)
    const hasReturn = searchResults?.return && searchResults.return.length > 0;
    if (
      (hasReturn && selectedOutbound && selectedReturn) ||
      (!hasReturn && selectedOutbound)
    ) {
      setCurrentStep('confirming');
    }
  };

  const confirmSelection = () => {
    if (!selectedOutbound) return;

    const selection = {
      outbound: selectedOutbound,
      return: selectedReturn || undefined
    };

    onFlightSelected(selection);
    
    toast({
      title: "🎉 Flights Selected!",
      description: "Your flight selection has been confirmed!"
    });
  };

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const renderFlightCard = (flight: FlightOption, type: 'outbound' | 'return', isSelected: boolean) => (
    <Card 
      key={flight.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
        isSelected ? 'ring-2 ring-primary shadow-elevated' : 'hover:scale-[1.02]'
      }`}
      onClick={() => handleFlightSelection(flight, type)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{flight.airline}</p>
                <p className="text-sm text-muted-foreground">{flight.airlineCode} • {flight.aircraft}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{flight.rating}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{formatPrice(flight.price)}</p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{flight.duration}</p>
              <p className="text-xs text-muted-foreground">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{flight.departureTime}</p>
              <p className="text-xs text-muted-foreground">{flight.arrivalTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{flight.seatsAvailable} seats</p>
              <p className="text-xs text-muted-foreground">{flight.bookingClass}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {flight.stops === 0 && <Badge variant="secondary" className="text-xs"><Zap className="w-3 h-3 mr-1" />Direct</Badge>}
          {flight.cancellation.includes('free') && <Badge variant="outline" className="text-xs"><Shield className="w-3 h-3 mr-1" />Free Cancel</Badge>}
          {flight.amenities.includes('Wi-Fi') && <Badge variant="outline" className="text-xs">Wi-Fi</Badge>}
          <Badge variant="outline" className="text-xs">{flight.carbonFootprint}</Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Baggage:</strong> {flight.baggage.carry} | {flight.baggage.checked}</p>
          <p><strong>Cancellation:</strong> {flight.cancellation}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (currentStep === 'searching' || isSearching) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-warm">
        <CardHeader className="bg-hero text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-6 h-6" />
            Flight Booking Agent ✈️
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl mb-4">🔍✈️</div>
            <h3 className="text-2xl font-bold">Searching for the Perfect Flights</h3>
            <p className="text-muted-foreground text-lg">
              I'm searching through hundreds of flight options from {tripData.source} to {tripData.destination}
            </p>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Route:</span>
                <span className="font-medium">{tripData.source} → {tripData.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Dates:</span>
                <span className="font-medium">{tripData.startDate} - {tripData.endDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Users className="w-4 h-4" />Travelers:</span>
                <span className="font-medium">{tripData.travellers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget:</span>
                <span className="font-medium">${tripData.budget}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              🌟 Analyzing prices, schedules, and comfort levels to find your best options...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'selecting' && searchResults) {
    return (
      <Card className="w-full max-w-6xl mx-auto shadow-warm">
        <CardHeader className="bg-hero text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-6 h-6" />
            Flight Options ✈️
          </CardTitle>
          <p className="text-primary-foreground/80">
            Found {searchResults.totalResults} options • Showing top 3 recommendations
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Outbound Flights */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Outbound: {tripData.source} → {tripData.destination}
              <Badge variant="secondary">{tripData.startDate}</Badge>
            </h3>
            <div className="space-y-4">
              {searchResults.outbound.map((flight) => 
                renderFlightCard(flight, 'outbound', selectedOutbound?.id === flight.id)
              )}
            </div>
          </div>

          {/* Return Flights */}
          {searchResults.return && (
            <div className="mb-8">
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 transform scale-x-[-1]" />
                Return: {tripData.destination} → {tripData.source}
                <Badge variant="secondary">{tripData.endDate}</Badge>
              </h3>
              <div className="space-y-4">
                {searchResults.return.map((flight) => 
                  renderFlightCard(flight, 'return', selectedReturn?.id === flight.id)
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              ← Back to Trip Details
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedOutbound ? '✅ Outbound selected' : '👆 Select outbound flight'}
                {searchResults.return && (selectedReturn ? ' • ✅ Return selected' : ' • 👆 Select return flight')}
              </p>
            </div>

            <Button 
              variant="hero" 
              disabled={!selectedOutbound || (searchResults.return && !selectedReturn)}
              className="animate-glow"
            >
              Continue to Confirmation →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'confirming' && selectedOutbound) {
    const totalPrice = selectedOutbound.price + (selectedReturn?.price || 0);
    const totalTravelers = parseInt(tripData.travellers);
    const grandTotal = totalPrice * totalTravelers;

    return (
      <Card className="w-full max-w-4xl mx-auto shadow-warm">
        <CardHeader className="bg-hero text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Confirm Your Flight Selection ✈️
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">🎉 Perfect Choice!</h3>
            
            {/* Flight Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Outbound Flight
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>{selectedOutbound.airline}</strong> ({selectedOutbound.airlineCode})</p>
                  <p>{tripData.startDate} • {selectedOutbound.departureTime} - {selectedOutbound.arrivalTime}</p>
                  <p>{selectedOutbound.duration} • {selectedOutbound.stops === 0 ? 'Direct' : `${selectedOutbound.stops} stops`}</p>
                  <p className="text-lg font-bold text-primary">{formatPrice(selectedOutbound.price)} per person</p>
                </div>
              </div>

              {selectedReturn && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Plane className="w-4 h-4 transform scale-x-[-1]" />
                    Return Flight
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{selectedReturn.airline}</strong> ({selectedReturn.airlineCode})</p>
                    <p>{tripData.endDate} • {selectedReturn.departureTime} - {selectedReturn.arrivalTime}</p>
                    <p>{selectedReturn.duration} • {selectedReturn.stops === 0 ? 'Direct' : `${selectedReturn.stops} stops`}</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(selectedReturn.price)} per person</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-hero/10 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Flight cost per person:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of travelers:</span>
                  <span>{totalTravelers}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Flight Cost:</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Budget remaining: {formatPrice(parseInt(tripData.budget) - grandTotal)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6">
              <Button variant="outline" onClick={() => setCurrentStep('selecting')}>
                ← Change Selection
              </Button>
              
              <Button 
                variant="hero" 
                size="lg"
                onClick={confirmSelection}
                className="animate-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Confirm Flights & Continue ✈️
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
