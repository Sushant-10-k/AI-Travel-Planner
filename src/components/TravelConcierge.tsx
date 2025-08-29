import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TripData {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travellers: string;
  interests: string[];
}

type CollectionStep = 'source' | 'destination' | 'dates' | 'budget' | 'travellers' | 'interests' | 'confirmation' | 'completed';

interface Props {
  onDataCollected?: (data: TripData) => void;
}

export default function TravelConcierge({ onDataCollected }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: `🌍 Hello there, wonderful traveler! I'm your friendly AI travel concierge, and I'm absolutely THRILLED to help you plan an amazing adventure! ✈️✨

I'm here to collect some exciting details about your dream trip so we can craft the perfect itinerary just for you! 🎯

Let's start with the basics - where would you like to begin this incredible journey? What's your starting point or home base? 🏠`,
    timestamp: new Date()
  }]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<CollectionStep>('source');
  const [tripData, setTripData] = useState<TripData>({
    source: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travellers: '',
    interests: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getResponseForStep = (userInput: string, step: CollectionStep): string => {
    const responses = {
      source: [
        `${userInput}! What a fantastic starting point! 🌟 I can already feel the excitement building!\n\nNow, let's talk about the fun part - where is your wanderlust calling you? What's your dream destination? 🗺️✨ (Could be a city, country, or even a region!)`,
        `Perfect! Starting from ${userInput} opens up so many amazing possibilities! 🚀\n\nSo tell me, where has your heart been longing to explore? What destination has been on your travel wishlist? 🎯💫`,
        `${userInput} - I love it! That's going to be such a great launching pad for your adventure! 🏃‍♀️💨\n\nNow, drum roll please... 🥁 Where would you like this magical journey to take you? What's your dream destination? 🌈`
      ],
      destination: [
        `${userInput}! OH MY GOODNESS, that sounds absolutely INCREDIBLE! 🎉🌟 I'm getting goosebumps just thinking about all the amazing experiences waiting for you there!\n\nNow let's talk timing - when would you like to embark on this fantastic adventure? Could you share your preferred start date? 📅 (Format: YYYY-MM-DD would be perfect!)`,
        `WOW! ${userInput} is such a phenomenal choice! 🤩 I can already picture you having the most amazing time there!\n\nLet's get the timing sorted - when would be the perfect time for you to start this incredible journey? What date works best for your departure? 🗓️✨`,
        `${userInput} - are you kidding me?! That's going to be AMAZING! 🎊 I'm so excited for you already!\n\nWhen would you like to kick off this epic adventure? Please share your ideal start date with me! 📅🚀`
      ],
      dates: [
        `Perfect timing! 🕐 That's going to be such a wonderful time to explore!\n\nAnd when should this incredible journey come to an end? What's your preferred return date? 📅 (This helps me understand how long you'll have to soak up all the amazing experiences!)`,
        `Excellent choice of timing! ⏰ I can already tell this is going to be perfectly planned!\n\nNow, when would you like to wrap up this adventure and return home? What's your ideal end date? 🏠✨`,
        `That's going to be such a great time to travel! 🌞 Perfect seasonal choice!\n\nWhen should this magical journey conclude? Please share your return date so I can make sure we maximize every single day! 📆🎯`
      ],
      budget: [
        `Fantastic! That gives us a perfect timeframe to work with! ⏱️\n\nNow let's talk about the practical side - what's your total budget for this incredible adventure? 💰 (Don't worry, I'm a wizard at making every penny count and creating maximum value!) ✨`,
        `Perfect duration for an amazing trip! 📊 You're going to have so much time to really immerse yourself in the experience!\n\nWhat's your budget looking like for this adventure? 💵 I promise to make every dollar work overtime to give you the best possible experience! 🎯`,
        `Love the timeframe! That's going to allow for some seriously amazing experiences! 🌟\n\nLet's talk numbers - what's your total budget for this dream trip? 💳 (I'm all about creating incredible value, so don't worry if it's modest - magic happens at every budget level!) ✨`
      ],
      travellers: [
        `That's a great budget to work with! 💪 I'm already brainstorming ways to create something absolutely spectacular within that range!\n\nNow, how many adventurers are we planning for? Just yourself, or are you bringing some amazing travel companions along for the ride? 👥✈️`,
        `Perfect! ${userInput} gives us fantastic flexibility to create something truly special! 🎊\n\nOne more detail - what's the size of your travel squad? Are you going solo or bringing friends/family along for this incredible journey? 🧳👫`,
        `Excellent budget! We're going to make some serious magic happen! ✨💯\n\nLast logistics question - how many total travelers are we planning this amazing adventure for? 👥 (Including yourself, of course!) 🙋‍♀️`
      ],
      interests: [
        `Perfect! ${userInput} ${parseInt(userInput) > 1 ? 'adventurers' : 'adventurer'} are going to have the absolute TIME OF YOUR LIVES! 🎉\n\nNow for my favorite part - tell me about your travel personality! What gets you most excited? Are you drawn to:\n\n🏖️ Beautiful beaches and coastal vibes?\n🏔️ Adventure sports and thrilling activities?\n🏛️ Rich culture and historical experiences?\n🍜 Amazing local food and culinary adventures?\n🛍️ Shopping and local markets?\n🌃 Vibrant nightlife and entertainment?\n🌲 Nature exploration and outdoor activities?\n\nFeel free to mention multiple interests - the more you tell me, the better I can personalize your perfect trip! ✨`,
        `Wonderful! Planning for ${userInput} ${parseInt(userInput) > 1 ? 'people' : 'person'} is going to be so much fun! 🌟\n\nNow, here's where it gets really exciting - what kind of experiences make your heart sing? What are you hoping to discover and enjoy? Think:\n\n🏖️ Beaches & water activities\n🏔️ Adventure & adrenaline\n🏛️ Culture & history\n🍜 Food & local cuisine\n🛍️ Shopping & local crafts\n🌃 Nightlife & entertainment\n🌲 Nature & outdoor exploration\n\nShare as many as resonate with you - variety makes for the BEST adventures! 🎯`,
        `${userInput} ${parseInt(userInput) > 1 ? 'travelers' : 'traveler'} - this is going to be EPIC! 🚀\n\nLet's dive into the fun stuff - what kind of experiences are you craving? What would make this trip absolutely unforgettable for you?\n\n🏖️ Beach bliss and ocean fun\n🏔️ Adventure and excitement\n🏛️ Cultural immersion and history\n🍜 Foodie experiences and local flavors\n🛍️ Shopping and unique finds\n🌃 Nightlife and social scenes\n🌲 Nature and outdoor adventures\n\nTell me everything that interests you - I want to create something perfectly tailored to YOUR dreams! ✨🎊`
      ]
    };
    
    const stepResponses = responses[step] || ['Great! Let me help you with that! 🌟'];
    return stepResponses[Math.floor(Math.random() * stepResponses.length)];
  };

  const parseInterests = (input: string): string[] => {
    const interestKeywords = {
      'beaches': ['beach', 'coastal', 'ocean', 'sea', 'water', 'swimming', 'sand'],
      'adventure': ['adventure', 'thrill', 'adrenaline', 'extreme', 'hiking', 'climbing', 'sports'],
      'culture': ['culture', 'cultural', 'history', 'historical', 'museum', 'heritage', 'traditional'],
      'food': ['food', 'cuisine', 'culinary', 'restaurant', 'dining', 'eating', 'local food'],
      'shopping': ['shopping', 'shop', 'market', 'buying', 'souvenirs', 'crafts', 'retail'],
      'nightlife': ['nightlife', 'night', 'party', 'bar', 'club', 'entertainment', 'music'],
      'nature': ['nature', 'outdoor', 'natural', 'wildlife', 'park', 'forest', 'mountains']
    };
    
    const foundInterests: string[] = [];
    const lowerInput = input.toLowerCase();
    
    Object.entries(interestKeywords).forEach(([interest, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        foundInterests.push(interest);
      }
    });
    
    return foundInterests;
  };

  const generateConfirmationSummary = (data: TripData): string => {
    const duration = data.startDate && data.endDate ? 
      Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    return `🎊 AMAZING! I've got all your wonderful details! Let me confirm this incredible journey we're planning:\n\n✈️ **Journey:** ${data.source} → ${data.destination}\n📅 **Adventure Dates:** ${data.startDate} to ${data.endDate} (${duration} fantastic days!)\n💰 **Budget:** $${data.budget || 'Flexible'}\n👥 **Travel Squad:** ${data.travellers} ${parseInt(data.travellers) > 1 ? 'adventurers' : 'adventurer'}\n❤️ **Your Interests:** ${data.interests.length > 0 ? data.interests.join(', ') + ' 🌟' : 'Open to all amazing experiences! 🌈'}\n\n🤔 Does this look absolutely perfect? If you'd like to adjust anything, just let me know! Otherwise, I'm ready to pass these exciting details to our expert trip planning team who will craft your dream itinerary! ✨\n\nType "YES" to confirm and proceed, or tell me what you'd like to change! 🎯`;
  };

  const processUserInput = async (userInput: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate thinking time
      
      let nextStep: CollectionStep = currentStep;
      const updatedData = { ...tripData };
      
      switch (currentStep) {
        case 'source':
          updatedData.source = userInput;
          nextStep = 'destination';
          break;
          
        case 'destination':
          updatedData.destination = userInput;
          nextStep = 'dates';
          break;
          
        case 'dates':
          if (!tripData.startDate) {
            updatedData.startDate = userInput;
            // Stay in dates step for end date
          } else {
            updatedData.endDate = userInput;
            nextStep = 'budget';
          }
          break;
          
        case 'budget':
          updatedData.budget = userInput;
          nextStep = 'travellers';
          break;
          
        case 'travellers':
          updatedData.travellers = userInput;
          nextStep = 'interests';
          break;
          
        case 'interests':
          const interests = parseInterests(userInput);
          updatedData.interests = interests;
          nextStep = 'confirmation';
          break;
          
        case 'confirmation':
          if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('confirm') || userInput.toLowerCase().includes('correct')) {
            nextStep = 'completed';
          }
          break;
      }
      
      setTripData(updatedData);
      
      // Generate appropriate response
      let response = '';
      if (currentStep === 'dates' && !tripData.startDate) {
        response = `Perfect! ${userInput} is going to be such an exciting start! 🌟\n\nAnd when would you like this amazing adventure to end? What's your return date? 📅`;
      } else if (nextStep === 'confirmation') {
        response = generateConfirmationSummary(updatedData);
      } else if (nextStep === 'completed') {
        response = `🎉 FANTASTIC! Your trip details have been confirmed and are being passed to our expert planning team!\n\n✨ Get ready for an absolutely INCREDIBLE adventure! Our specialists will now craft a personalized itinerary that perfectly matches your interests and budget!\n\n🚀 Thank you for letting me be part of planning your dream trip! This is going to be AMAZING! 🌟\n\n*[Trip details successfully collected and ready for the next agent]* 📋✅`;
      } else {
        response = getResponseForStep(userInput, currentStep as CollectionStep);
      }
      
      setCurrentStep(nextStep);
      
      setTimeout(() => {
        addMessage('assistant', response);
      }, 500);
      
    } catch (error) {
      addMessage('assistant', `Oops! Something went wrong on my end! 😅 But don't worry - I'm still here and excited to help you plan this amazing trip! Could you try that again? ✨`);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    addMessage('user', userInput);
    setInput('');
    
    await processUserInput(userInput);
  };

  const handleComplete = () => {
    toast({ 
      title: "🎉 Trip Details Collected!", 
      description: "Your information has been passed to our planning specialists!" 
    });
    
    console.log('Collected Trip Data for Next Agent:', tripData);
    
    // Call the callback to pass data to the next agent
    if (onDataCollected) {
      onDataCollected(tripData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-warm hover:shadow-elevated transition-all duration-300">
      <CardHeader className="bg-hero text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Input Collector Agent 🌍
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 max-w-xs lg:max-w-md ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`p-3 rounded-lg whitespace-pre-line ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {currentStep === 'completed' ? (
          <div className="p-4 border-t bg-muted/20">
            <Button 
              onClick={handleComplete}
              variant="hero" 
              size="lg" 
              className="w-full animate-glow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              ✨ Pass to Planning Specialists ✨
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentStep === 'confirmation' ? 'Type "YES" to confirm or let me know changes...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                variant="hero"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
