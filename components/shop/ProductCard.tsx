"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  name: string;
  description: string;
  price: string;
  image?: string;
}

export function ProductCard({ name, description, price, image }: ProductCardProps) {
  return (
    <Card className="glass-card flex flex-col">
      <CardHeader>
        {image ? (
          <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
            <span className="text-muted-foreground">Image</span>
          </div>
        ) : null}
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl font-bold text-primary">{price}</div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

