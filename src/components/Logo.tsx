import { MapPin, Plane } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = "", size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl", 
    lg: "text-4xl"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <MapPin className={`${iconSizes[size]} text-primary`} />
        <Plane className={`${iconSizes[size]} text-accent absolute -top-1 -right-1 transform rotate-45`} />
      </div>
      <span className={`font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${sizeClasses[size]}`}>
        Plan My Trip
      </span>
    </div>
  );
};

export default Logo;
