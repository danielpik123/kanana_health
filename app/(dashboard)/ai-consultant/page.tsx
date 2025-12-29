import { ChatInterface } from "@/components/ai-consultant/ChatInterface";

export default function AIConsultantPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Consultant</h1>
        <p className="text-muted-foreground">
          Get personalized health insights and recommendations based on your data
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}

