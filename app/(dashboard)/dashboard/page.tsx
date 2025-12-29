import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BioAgeGauge } from "@/components/dashboard/BioAgeGauge";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { healthScores } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <BioAgeGauge />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthScores.map((score) => (
            <HealthScoreCard
              key={score.category}
              category={score.category}
              score={score.score}
              status={score.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

