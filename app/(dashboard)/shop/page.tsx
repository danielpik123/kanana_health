import { ProductGrid } from "@/components/shop/ProductGrid";

const products = [
  {
    id: "supplement-pack-1",
    name: "Custom Supplement Pack",
    description:
      "Personalized supplement pack tailored to your bloodwork results. Includes vitamins, minerals, and nutrients optimized for your specific biomarker profile.",
    price: "$149.99",
  },
  {
    id: "oura-ring",
    name: "Oura Ring Gen3",
    description:
      "Advanced sleep and activity tracking ring. Monitor your sleep quality, HRV, resting heart rate, and recovery metrics 24/7.",
    price: "$299.99",
  },
  {
    id: "cgm-sensors",
    name: "CGM Sensors (30-day pack)",
    description:
      "Continuous Glucose Monitoring sensors for real-time blood glucose tracking. Get insights into your metabolic health and glucose patterns.",
    price: "$199.99",
  },
  {
    id: "supplement-pack-2",
    name: "Hormone Optimization Pack",
    description:
      "Specialized supplement pack designed to support optimal hormone levels based on your test results.",
    price: "$179.99",
  },
  {
    id: "supplement-pack-3",
    name: "Cardiovascular Support Pack",
    description:
      "Targeted nutrients and supplements to support heart health and optimize cardiovascular biomarkers.",
    price: "$159.99",
  },
  {
    id: "supplement-pack-4",
    name: "Metabolic Health Pack",
    description:
      "Comprehensive supplement stack for metabolic optimization, blood sugar management, and energy production.",
    price: "$169.99",
  },
];

export default function ShopPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
        <p className="text-muted-foreground">
          Discover products tailored to optimize your health
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}

