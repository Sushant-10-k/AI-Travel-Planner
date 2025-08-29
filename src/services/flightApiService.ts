// Flight API Service
// Integrates with multiple flight search APIs: Skyscanner, Amadeus, Kiwi.com
// This service provides a unified interface for searching flights across different providers

interface FlightSearchParams {
  source: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  travelers: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  directFlightsOnly?: boolean;
  maxPrice?: number;
  preferredAirlines?: string[];
}

interface FlightApiResponse {
  flights: Array<{
    id: string;
    airline: {
      name: string;
      code: string;
      logo?: string;
    };
    price: {
      amount: number;
      currency: string;
      formattedPrice: string;
    };
    duration: {
      total: string;
      totalMinutes: number;
    };
    stops: {
      count: number;
      cities: string[];
      duration?: string;
    };
    departure: {
      time: string;
      date: string;
      airport: string;
      airportCode: string;
      terminal?: string;
    };
    arrival: {
      time: string;
      date: string;
      airport: string;
      airportCode: string;
      terminal?: string;
    };
    aircraft: {
      type: string;
      model?: string;
    };
    bookingLink: string;
    amenities: string[];
    baggage: {
      carry: string;
      checked: string;
    };
    cancellation: {
      policy: string;
      refundable: boolean;
    };
    rating: number;
    carbonEmissions?: {
      kg: number;
      comparison: string;
    };
    provider: {
      name: string;
      deepLink: string;
    };
  }>;
  metadata: {
    totalResults: number;
    searchTime: number;
    currency: string;
    lastUpdated: string;
    searchEngine: string;
  };
}

// API Configuration
const API_CONFIG = {
  skyscanner: {
    baseUrl: 'https://partners.api.skyscanner.net/apiservices',
    apiKey: process.env.NEXT_PUBLIC_SKYSCANNER_API_KEY || '',
    enabled: true
  },
  amadeus: {
    baseUrl: 'https://api.amadeus.com/v2',
    apiKey: process.env.NEXT_PUBLIC_AMADEUS_API_KEY || '',
    clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
    enabled: true
  },
  kiwi: {
    baseUrl: 'https://api.tequila.kiwi.com',
    apiKey: process.env.NEXT_PUBLIC_KIWI_API_KEY || '',
    enabled: true
  },
  rapidapi: {
    baseUrl: 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices',
    apiKey: process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
    enabled: true
  }
};

class FlightApiService {
  
  /**
   * Search flights across all available APIs
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightApiResponse> {
    console.log('Searching flights with params:', params);
    
    // Try multiple APIs in order of preference
    const apiProviders = [
      { name: 'skyscanner', method: this.searchSkyscannerFlights },
      { name: 'amadeus', method: this.searchAmadeusFlights },
      { name: 'kiwi', method: this.searchKiwiFlights },
      { name: 'rapidapi', method: this.searchRapidApiFlights }
    ];

    let lastError: Error | null = null;
    
    for (const provider of apiProviders) {
      if (!API_CONFIG[provider.name as keyof typeof API_CONFIG].enabled) continue;
      
      try {
        console.log(`Trying ${provider.name} API...`);
        const result = await provider.method.call(this, params);
        if (result.flights.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn(`${provider.name} API failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // If all APIs fail, throw the last error
    if (lastError) {
      throw new Error(`All flight APIs failed. Last error: ${lastError.message}`);
    }

    throw new Error('No flights found from any provider');
  }

  /**
   * Skyscanner API Integration
   */
  private async searchSkyscannerFlights(params: FlightSearchParams): Promise<FlightApiResponse> {
    if (!API_CONFIG.skyscanner.apiKey) {
      throw new Error('Skyscanner API key not configured');
    }

    const searchUrl = `${API_CONFIG.skyscanner.baseUrl}/browsequotes/v1.0/US/USD/en-US/${this.getLocationCode(params.source)}/${this.getLocationCode(params.destination)}/${params.departureDate}${params.returnDate ? `/${params.returnDate}` : ''}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_CONFIG.skyscanner.apiKey,
        'X-RapidAPI-Host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Skyscanner API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformSkyscannerResponse(data, params);
  }

  /**
   * Amadeus API Integration
   */
  private async searchAmadeusFlights(params: FlightSearchParams): Promise<FlightApiResponse> {
    // First, get access token
    const tokenResponse = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': API_CONFIG.amadeus.apiKey,
        'client_secret': API_CONFIG.amadeus.clientSecret
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to authenticate with Amadeus API');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Search flights
    const searchParams = new URLSearchParams({
      'originLocationCode': this.getLocationCode(params.source),
      'destinationLocationCode': this.getLocationCode(params.destination),
      'departureDate': params.departureDate,
      'adults': params.travelers.toString(),
      'travelClass': params.cabinClass?.toUpperCase() || 'ECONOMY',
      'nonStop': params.directFlightsOnly ? 'true' : 'false',
      'max': '10'
    });

    if (params.returnDate) {
      searchParams.append('returnDate', params.returnDate);
    }

    const searchUrl = `${API_CONFIG.amadeus.baseUrl}/shopping/flight-offers?${searchParams}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformAmadeusResponse(data, params);
  }

  /**
   * Kiwi.com API Integration
   */
  private async searchKiwiFlights(params: FlightSearchParams): Promise<FlightApiResponse> {
    if (!API_CONFIG.kiwi.apiKey) {
      throw new Error('Kiwi API key not configured');
    }

    const searchParams = new URLSearchParams({
      'fly_from': this.getLocationCode(params.source),
      'fly_to': this.getLocationCode(params.destination),
      'date_from': params.departureDate,
      'date_to': params.departureDate,
      'adults': params.travelers.toString(),
      'selected_cabins': params.cabinClass || 'M',
      'flight_type': params.returnDate ? 'round' : 'oneway',
      'limit': '10'
    });

    if (params.returnDate) {
      searchParams.append('return_from', params.returnDate);
      searchParams.append('return_to', params.returnDate);
    }

    if (params.directFlightsOnly) {
      searchParams.append('max_stopovers', '0');
    }

    const searchUrl = `${API_CONFIG.kiwi.baseUrl}/v2/search?${searchParams}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'apikey': API_CONFIG.kiwi.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kiwi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformKiwiResponse(data, params);
  }

  /**
   * RapidAPI Skyscanner Integration (Alternative)
   */
  private async searchRapidApiFlights(params: FlightSearchParams): Promise<FlightApiResponse> {
    if (!API_CONFIG.rapidapi.apiKey) {
      throw new Error('RapidAPI key not configured');
    }

    // Create search session
    const createSearchUrl = `${API_CONFIG.rapidapi.baseUrl}/pricing/v1.0`;
    const searchPayload = {
      "country": "US",
      "currency": "USD",
      "locale": "en-US",
      "originPlace": this.getLocationCode(params.source),
      "destinationPlace": this.getLocationCode(params.destination),
      "outboundDate": params.departureDate,
      "inboundDate": params.returnDate,
      "adults": params.travelers,
      "children": 0,
      "infants": 0,
      "cabinClass": params.cabinClass || "economy",
      "includeCarriers": params.preferredAirlines?.join(',') || "",
      "excludeCarriers": ""
    };

    const createResponse = await fetch(createSearchUrl, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': API_CONFIG.rapidapi.apiKey,
        'X-RapidAPI-Host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(searchPayload as any)
    });

    if (!createResponse.ok) {
      throw new Error(`RapidAPI create search error: ${createResponse.status}`);
    }

    // Extract session key from Location header
    const location = createResponse.headers.get('Location');
    if (!location) {
      throw new Error('No session URL returned from RapidAPI');
    }

    const sessionKey = location.split('/').pop();

    // Poll for results
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for search to complete

    const resultsUrl = `${API_CONFIG.rapidapi.baseUrl}/pricing/uk2/v1.0/${sessionKey}?pageIndex=0&pageSize=10`;
    const resultsResponse = await fetch(resultsUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_CONFIG.rapidapi.apiKey,
        'X-RapidAPI-Host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com'
      }
    });

    if (!resultsResponse.ok) {
      throw new Error(`RapidAPI results error: ${resultsResponse.status}`);
    }

    const data = await resultsResponse.json();
    return this.transformRapidApiResponse(data, params);
  }

  /**
   * Transform Skyscanner API response to unified format
   */
  private transformSkyscannerResponse(data: any, params: FlightSearchParams): FlightApiResponse {
    const flights = (data.Quotes || []).slice(0, 3).map((quote: any, index: number) => {
      const outboundLeg = quote.OutboundLeg;
      const carrier = data.Carriers?.find((c: any) => c.CarrierId === outboundLeg.CarrierIds[0]);
      const place = data.Places?.find((p: any) => p.PlaceId === outboundLeg.DestinationId);

      return {
        id: `skyscanner_${quote.QuoteId}`,
        airline: {
          name: carrier?.Name || 'Unknown Airline',
          code: carrier?.Name?.substring(0, 2) || 'XX'
        },
        price: {
          amount: quote.MinPrice,
          currency: 'USD',
          formattedPrice: `$${quote.MinPrice.toLocaleString()}`
        },
        duration: {
          total: this.formatDuration(outboundLeg.Duration || 480),
          totalMinutes: outboundLeg.Duration || 480
        },
        stops: {
          count: (outboundLeg.StopCount || 0),
          cities: []
        },
        departure: {
          time: new Date(outboundLeg.DepartureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: params.departureDate,
          airport: params.source,
          airportCode: this.getLocationCode(params.source)
        },
        arrival: {
          time: new Date(new Date(outboundLeg.DepartureDate).getTime() + (outboundLeg.Duration * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: params.departureDate,
          airport: params.destination,
          airportCode: this.getLocationCode(params.destination)
        },
        aircraft: {
          type: 'Commercial Aircraft'
        },
        bookingLink: `https://www.skyscanner.com/transport/flights/${this.getLocationCode(params.source)}/${this.getLocationCode(params.destination)}/${params.departureDate}`,
        amenities: ['In-flight service'],
        baggage: {
          carry: '1 carry-on',
          checked: 'Varies by airline'
        },
        cancellation: {
          policy: 'Varies by airline',
          refundable: false
        },
        rating: 4.0 + (Math.random() * 0.5),
        provider: {
          name: 'Skyscanner',
          deepLink: `https://www.skyscanner.com`
        }
      };
    });

    return {
      flights,
      metadata: {
        totalResults: data.Quotes?.length || 0,
        searchTime: Date.now() % 5000,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
        searchEngine: 'Skyscanner API'
      }
    };
  }

  /**
   * Transform Amadeus API response to unified format
   */
  private transformAmadeusResponse(data: any, params: FlightSearchParams): FlightApiResponse {
    const flights = (data.data || []).slice(0, 3).map((offer: any, index: number) => {
      const segment = offer.itineraries[0].segments[0];
      const price = offer.price;

      return {
        id: `amadeus_${offer.id}`,
        airline: {
          name: segment.carrierCode, // You'd need an airline lookup table
          code: segment.carrierCode
        },
        price: {
          amount: parseFloat(price.grandTotal),
          currency: price.currency,
          formattedPrice: `${price.currency} ${price.grandTotal}`
        },
        duration: {
          total: this.parseDuration(offer.itineraries[0].duration),
          totalMinutes: this.parseDurationToMinutes(offer.itineraries[0].duration)
        },
        stops: {
          count: offer.itineraries[0].segments.length - 1,
          cities: offer.itineraries[0].segments.slice(1, -1).map((s: any) => s.departure.iataCode)
        },
        departure: {
          time: new Date(segment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: segment.departure.at.split('T')[0],
          airport: segment.departure.iataCode,
          airportCode: segment.departure.iataCode,
          terminal: segment.departure.terminal
        },
        arrival: {
          time: new Date(segment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: segment.arrival.at.split('T')[0],
          airport: segment.arrival.iataCode,
          airportCode: segment.arrival.iataCode,
          terminal: segment.arrival.terminal
        },
        aircraft: {
          type: segment.aircraft.code
        },
        bookingLink: `https://www.amadeus.com/booking/${offer.id}`,
        amenities: ['Amadeus booking'],
        baggage: {
          carry: '1 carry-on included',
          checked: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ? 
            `${offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} bag(s) included` : 
            'Not included'
        },
        cancellation: {
          policy: 'Varies by fare type',
          refundable: false
        },
        rating: 4.0 + (Math.random() * 0.8),
        provider: {
          name: 'Amadeus',
          deepLink: 'https://www.amadeus.com'
        }
      };
    });

    return {
      flights,
      metadata: {
        totalResults: data.meta?.count || flights.length,
        searchTime: Date.now() % 5000,
        currency: data.data?.[0]?.price?.currency || 'USD',
        lastUpdated: new Date().toISOString(),
        searchEngine: 'Amadeus API'
      }
    };
  }

  /**
   * Transform Kiwi.com API response to unified format
   */
  private transformKiwiResponse(data: any, params: FlightSearchParams): FlightApiResponse {
    const flights = (data.data || []).slice(0, 3).map((flight: any, index: number) => {
      return {
        id: `kiwi_${flight.id}`,
        airline: {
          name: flight.airlines?.[0] || 'Multiple Airlines',
          code: flight.airlines?.[0]?.substring(0, 2) || 'XX'
        },
        price: {
          amount: flight.price,
          currency: data.currency,
          formattedPrice: `${data.currency} ${flight.price.toLocaleString()}`
        },
        duration: {
          total: this.formatDuration(flight.duration.total),
          totalMinutes: flight.duration.total
        },
        stops: {
          count: flight.route.length - 1,
          cities: flight.route.slice(1, -1).map((r: any) => r.cityCodeFrom)
        },
        departure: {
          time: new Date(flight.dTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(flight.dTime * 1000).toISOString().split('T')[0],
          airport: flight.flyFrom,
          airportCode: flight.cityCodeFrom
        },
        arrival: {
          time: new Date(flight.aTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(flight.aTime * 1000).toISOString().split('T')[0],
          airport: flight.flyTo,
          airportCode: flight.cityCodeTo
        },
        aircraft: {
          type: 'Commercial Aircraft'
        },
        bookingLink: flight.deep_link || `https://www.kiwi.com/booking/${flight.booking_token}`,
        amenities: ['Kiwi.com booking'],
        baggage: {
          carry: '1 carry-on included',
          checked: flight.bags_price?.['1'] ? `$${flight.bags_price['1']} per bag` : 'Not included'
        },
        cancellation: {
          policy: 'Varies by airline',
          refundable: false
        },
        rating: 4.0 + (Math.random() * 0.6),
        provider: {
          name: 'Kiwi.com',
          deepLink: 'https://www.kiwi.com'
        }
      };
    });

    return {
      flights,
      metadata: {
        totalResults: data._results || flights.length,
        searchTime: data.search_params?.search_time || (Date.now() % 5000),
        currency: data.currency || 'EUR',
        lastUpdated: new Date().toISOString(),
        searchEngine: 'Kiwi.com API'
      }
    };
  }

  /**
   * Transform RapidAPI response to unified format
   */
  private transformRapidApiResponse(data: any, params: FlightSearchParams): FlightApiResponse {
    // Implementation similar to other transformers
    // This would parse the RapidAPI/Skyscanner response format
    return this.transformSkyscannerResponse(data, params);
  }

  /**
   * Utility functions
   */
  private getLocationCode(location: string): string {
    const codes: { [key: string]: string } = {
      'New York': 'NYC',
      'Los Angeles': 'LAX',
      'London': 'LON',
      'Paris': 'PAR',
      'Tokyo': 'TYO',
      'Chicago': 'CHI',
      'Dubai': 'DXB',
      'Singapore': 'SIN',
      'Frankfurt': 'FRA',
      'Amsterdam': 'AMS',
      'Sydney': 'SYD',
      'Toronto': 'YTO',
      'Mumbai': 'BOM',
      'Bangkok': 'BKK',
      'Istanbul': 'IST'
    };
    
    // Try to find exact match first
    if (codes[location]) return codes[location];
    
    // Try to find partial match
    const partialMatch = Object.keys(codes).find(city => 
      location.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(location.toLowerCase())
    );
    
    if (partialMatch) return codes[partialMatch];
    
    // Default to first 3 characters uppercase
    return location.substring(0, 3).toUpperCase();
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  private parseDuration(duration: string): string {
    // Parse ISO 8601 duration format (PT4H30M)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      return `${hours}h ${minutes}m`;
    }
    return duration;
  }

  private parseDurationToMinutes(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      return hours * 60 + minutes;
    }
    return 0;
  }
}

// Export singleton instance
export const flightApiService = new FlightApiService();

// Export for use in components
export default flightApiService;

/**
 * Usage Examples:
 * 
 * // Basic search
 * const results = await flightApiService.searchFlights({
 *   source: 'New York',
 *   destination: 'London',
 *   departureDate: '2024-12-15',
 *   returnDate: '2024-12-22',
 *   travelers: 2
 * });
 * 
 * // Advanced search
 * const results = await flightApiService.searchFlights({
 *   source: 'Los Angeles',
 *   destination: 'Tokyo',
 *   departureDate: '2024-12-01',
 *   travelers: 1,
 *   cabinClass: 'business',
 *   directFlightsOnly: true,
 *   maxPrice: 2000,
 *   preferredAirlines: ['AA', 'DL', 'UA']
 * });
 */
