"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { scaleIn } from "@/components/animations/variants";
import { LucideIcon } from "lucide-react";

interface ProductCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  href: string;
  buttonText?: string;
}

export default function ProductCard({ 
  icon: Icon, 
  title, 
  description, 
  price, 
  href, 
  buttonText = "Adquiérelo ahora" 
}: ProductCardProps) {
  return (
    <motion.div variants={scaleIn}>
      <Card className="group hover:scale-105 transition-all duration-300 glass-effect border-primary/20 hover:border-primary/40">
        <CardContent className="p-6 text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:animate-glow">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="font-heading font-semibold text-xl">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-primary">{price}</div>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Link href={href}>{buttonText}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
