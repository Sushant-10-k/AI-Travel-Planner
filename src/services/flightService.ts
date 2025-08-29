// Flight Search Service - Integrates with multiple flight APIs
// Currently set up for Skyscanner API integration

interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  adults: number;
  children?: number;
  infants?: number;
  sortBy: 'price' | 'fastest' | 'best';
  filters?: {
    maxPrice?: number;
    maxStops?: number;
    airlines?: string[];
    departureTimeFrom?: string;
    departureTimeTo?: string;
    maxDuration?: number;
  };
}

interface SkyscannerFlightOption {
  id: string;
  price: {
    amount: number;
    currency: string;
    updateStatus: string;
  };
  legs: Array<{
    id: string;
    origin: {
      id: string;
      entityId: string;
      name: string;
      displayCode: string;
      city: string;
      country: string;
    };
    destination: {
      id: string;
      entityId: string;
      name: string;
      displayCode: string;
      city: string;
      country: string;
    };
    departure: string;
    arrival: string;
    durationInMinutes: number;
    stopCount: number;
    marketingCarrier: {
      id: number;
      name: string;
      alternateId: string;
      allianceId: number;
      displayCode: string;
    };
    operatingCarrier: {
      id: number;
      name: string;
      alternateId: string;
      allianceId: number;
      displayCode: string;
    };
  }>;
  isSelfTransfer: boolean;
  isProtectedSelfTransfer: boolean;
  farePolicy: {
    isChangeAllowed: boolean;
    isPartiallyChangeable: boolean;
    isCancellationAllowed: boolean;
    isPartiallyRefundable: boolean;
  };
  eco: {
    ecoContenderDelta: number;
  };
  fareAttributes: Record<string, any>;
  tags: Array<{
    tag: string;
  }>;
  isMachineBookable: boolean;
  flagsAndNotices: {
    cheapest: boolean;
    fastest: boolean;
    shortest: boolean;
  };
  bookingOptions: Array<{
    bookingItems: Array<{
      price: {
        amount: number;
        currency: string;
        updateStatus: string;
      };
      agentId: string;
      deepLink: string;
    }>;
  }>;
}

interface FlightAPI {
  searchFlights(params: FlightSearchParams): Promise<SkyscannerFlightOption[]>;
  getAirportCode(query: string): Promise<string>;
  getFlightDetails(flightId: string): Promise<any>;
}

class SkyscannerAPI implements FlightAPI {
  private baseUrl = 'https://sky-scrapper.p.rapidapi.com/api/v1';
  private apiKey: string;
  private headers: Record<string, string>;

  constructor() {
    // In production, these should come from environment variables
    this.apiKey = process.env.REACT_APP_RAPIDAPI_KEY || '';
    this.headers = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
      'Content-Type': 'application/json'
    };
  }

  async searchFlights(params: FlightSearchParams): Promise<SkyscannerFlightOption[]> {
    if (!this.apiKey) {
      console.warn('RapidAPI key not configured, using mock data');
      return this.getMockFlights();
    }

    try {
      const searchUrl = `${this.baseUrl}/flights/searchFlights`;
      
      const requestBody = {
        originSkyId: params.originSkyId,
        destinationSkyId: params.destinationSkyId,
        originEntityId: params.originEntityId,
        destinationEntityId: params.destinationEntityId,
        cabinClass: params.cabinClass,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        sortBy: params.sortBy,
        currency: 'USD',
        market: 'en-US',
        countryCode: 'US'
      };

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Skyscanner API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.itineraries || [];

    } catch (error) {
      console.error('Skyscanner API search failed:', error);
      // Fallback to mock data
      return this.getMockFlights();
    }
  }

  async getAirportCode(query: string): Promise<string> {
    if (!this.apiKey) {
      return this.getMockAirportCode(query);
    }

    try {
      const searchUrl = `${this.baseUrl}/flights/searchAirport?query=${encodeURIComponent(query)}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Airport search error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.[0]?.skyId || query;

    } catch (error) {
      console.error('Airport search failed:', error);
      return this.getMockAirportCode(query);
    }
  }

  async getFlightDetails(flightId: string): Promise<any> {
    // Implementation for getting detailed flight information
    try {
      const response = await fetch(`${this.baseUrl}/flights/detail?itineraryId=${flightId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Flight details error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Flight details fetch failed:', error);
      return null;
    }
  }

  private getMockFlights(): SkyscannerFlightOption[] {
    // Mock data for development/fallback
    return [
      {
        id: 'mock_flight_1',
        price: { amount: 450, currency: 'USD', updateStatus: 'CURRENT' },
        legs: [{
          id: 'leg_1',
          origin: { id: 'JFK', entityId: 'JFK', name: 'John F Kennedy Intl', displayCode: 'JFK', city: 'New York', country: 'US' },
          destination: { id: 'LAX', entityId: 'LAX', name: 'Los Angeles Intl', displayCode: 'LAX', city: 'Los Angeles', country: 'US' },
          departure: '2024-03-15T10:30:00',
          arrival: '2024-03-15T19:00:00',
          durationInMinutes: 390,
          stopCount: 0,
          marketingCarrier: { id: 1, name: 'Delta Airlines', alternateId: 'DL', allianceId: 1, displayCode: 'DL' },
          operatingCarrier: { id: 1, name: 'Delta Airlines', alternateId: 'DL', allianceId: 1, displayCode: 'DL' }
        }],
        isSelfTransfer: false,
        isProtectedSelfTransfer: false,
        farePolicy: { isChangeAllowed: true, isPartiallyChangeable: false, isCancellationAllowed: true, isPartiallyRefundable: false },
        eco: { ecoContenderDelta: 0 },
        fareAttributes: {},
        tags: [{ tag: 'shortest' }],
        isMachineBookable: true,
        flagsAndNotices: { cheapest: true, fastest: true, shortest: true },
        bookingOptions: [{
          bookingItems: [{
            price: { amount: 450, currency: 'USD', updateStatus: 'CURRENT' },
            agentId: 'skyscanner',
            deepLink: 'https://www.skyscanner.com/transport/flights/nyca/laxa/'
          }]
        }]
      }
    ];
  }

  private getMockAirportCode(query: string): string {
    const mockCodes: Record<string, string> = {
      'new york': 'NYCA',
      'nyc': 'NYCA', 
      'jfk': 'NYCA',
      'los angeles': 'LAXA',
      'la': 'LAXA',
      'lax': 'LAXA',
      'london': 'LOND',
      'paris': 'PARI',
      'tokyo': 'TYOA',
      'miami': 'MIAM',
      'chicago': 'CHIA'
    };
    
    return mockCodes[query.toLowerCase()] || query.toUpperCase();
  }
}

// Alternative APIs can be added here
class AmadeusAPI implements FlightAPI {
  // Implementation for Amadeus API
  async searchFlights(params: FlightSearchParams): Promise<SkyscannerFlightOption[]> {
    // Amadeus API integration
    throw new Error('Amadeus API not implemented yet');
  }

  async getAirportCode(query: string): Promise<string> {
    throw new Error('Amadeus API not implemented yet');
  }

  async getFlightDetails(flightId: string): Promise<any> {
    throw new Error('Amadeus API not implemented yet');
  }
}

// Service factory
class FlightSearchService {
  private api: FlightAPI;

  constructor(provider: 'skyscanner' | 'amadeus' = 'skyscanner') {
    switch (provider) {
      case 'skyscanner':
        this.api = new SkyscannerAPI();
        break;
      case 'amadeus':
        this.api = new AmadeusAPI();
        break;
      default:
        this.api = new SkyscannerAPI();
    }
  }

  async searchFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
    budget?: number;
  }): Promise<SkyscannerFlightOption[]> {
    // Convert location names to airport codes
    const originCode = await this.api.getAirportCode(params.origin);
    const destinationCode = await this.api.getAirportCode(params.destination);

    const searchParams: FlightSearchParams = {
      originSkyId: originCode,
      destinationSkyId: destinationCode,
      originEntityId: originCode,
      destinationEntityId: destinationCode,
      cabinClass: params.cabinClass || 'economy',
      adults: params.adults,
      sortBy: 'best',
      filters: params.budget ? { maxPrice: params.budget } : undefined
    };

    const results = await this.api.searchFlights(searchParams);
    
    // Return top 3 results
    return results.slice(0, 3);
  }

  async getFlightDetails(flightId: string): Promise<any> {
    return await this.api.getFlightDetails(flightId);
  }

  // Utility methods for the flight booking agent
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculateStops(legs: any[]): number {
    return legs.reduce((total, leg) => total + leg.stopCount, 0);
  }

  getAirlineName(carrier: any): string {
    return carrier?.name || 'Unknown Airline';
  }

  getAirlineCode(carrier: any): string {
    return carrier?.displayCode || carrier?.alternateId || 'XX';
  }
}

// Singleton instance
export const flightService = new FlightSearchService('skyscanner');
export default flightService;

// Types for easy importing
export type {
  FlightSearchParams,
  SkyscannerFlightOption,
  FlightAPI
};
