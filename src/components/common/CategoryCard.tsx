"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  variants: any;
}

export default function CategoryCard({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  variants 
}: CategoryCardProps) {
  return (
    <motion.div variants={variants}>
      <Link href={href} className="group">
        <Card className="h-48 relative overflow-hidden glass-effect border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-0 h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300" />
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6">
              <Icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-heading font-semibold text-xl mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
