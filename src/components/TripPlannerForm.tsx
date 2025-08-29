import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";


type FormData = {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travellers: string;
};

interface Props {
  onDataCollected?: (data: FormData & { interests: string[] }) => void;
}

export default function TripPlannerForm({ onDataCollected }: Props) {
  const [data, setData] = useState<FormData>({
    source: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travellers: "1",
  });
  const [submitted, setSubmitted] = useState(false);

  const days = useMemo(() => {
    if (!data.startDate || !data.endDate) return 0;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }, [data.startDate, data.endDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.source || !data.destination || !data.startDate || !data.endDate) {
      toast({ title: "Missing details", description: "Please fill source, destination and dates." });
      return;
    }
    setSubmitted(true);
    toast({ title: "Trip details collected!", description: "Proceeding to create your itinerary..." });
    
    // Call the callback with the collected data
    if (onDataCollected) {
      setTimeout(() => {
        onDataCollected({
          ...data,
          interests: [] // Form doesn't collect interests, so we provide an empty array
        });
      }, 2000); // Give user time to see the summary
    }
  }

  return (
    <section aria-labelledby="plan-trip" className="container mx-auto">
      <Card className="shadow-warm hover:shadow-elevated transition-all duration-300">
        <CardHeader>
          <CardTitle id="plan-trip">Plan your perfect trip</CardTitle>
          <CardDescription>Tell us a few details and we’ll tailor an itinerary just for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source">Starting point</Label>
              <Input id="source" placeholder="e.g., New York" value={data.source}
                onChange={(e) => setData({ ...data, source: e.target.value })} aria-label="Trip starting point" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="e.g., Tokyo" value={data.destination}
                onChange={(e) => setData({ ...data, destination: e.target.value })} aria-label="Trip destination" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" value={data.startDate}
                onChange={(e) => setData({ ...data, startDate: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" value={data.endDate}
                onChange={(e) => setData({ ...data, endDate: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (total)</Label>
              <Input id="budget" type="number" min={0} step="50" placeholder="e.g., 2500" value={data.budget}
                onChange={(e) => setData({ ...data, budget: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travellers">Travellers</Label>
              <Input id="travellers" type="number" min={1} max={20} step="1" value={data.travellers}
                onChange={(e) => setData({ ...data, travellers: e.target.value })} />
            </div>


            <div className="md:col-span-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{days > 0 ? `${days} day(s)` : "Select dates"}</p>
              <Button type="submit" variant="hero" size="lg" className="animate-glow">Craft my itinerary</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {submitted && (
        <Card className="mt-8 shadow-warm hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle>Your trip summary</CardTitle>
            <CardDescription>Here’s a high-level outline we’ll refine next.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p><strong>From:</strong> {data.source}</p>
              <p><strong>To:</strong> {data.destination}</p>
              <p><strong>Dates:</strong> {data.startDate} → {data.endDate} ({days} days)</p>
            </div>
            <div className="space-y-2">
              <p><strong>Travellers:</strong> {data.travellers}</p>
              <p><strong>Budget:</strong> {data.budget ? `$${data.budget}` : "—"}</p>
            </div>
            <div className="md:col-span-2 text-sm text-muted-foreground">
              We'll balance travel time and must-see spots to design a smooth, unforgettable journey.
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
