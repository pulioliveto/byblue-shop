"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Truck, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/components/animations/variants";
import NetworkAnimation from "@/components/animations/network-animation";

export default function HeroSection() {
  return (
    <motion.section 
      className="relative pt-24 pb-16 overflow-hidden min-h-[80vh] flex items-center"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />

      <div className="absolute right-0 top-0 w-1/2 h-full opacity-40 lg:opacity-70">
        <NetworkAnimation />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <motion.div className="space-y-8" variants={staggerContainer}>
            <div className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  Tecnología Premium
                </Badge>
              </motion.div>
              <motion.h1 
                className="font-heading font-bold text-4xl sm:text-5xl lg:text-7xl leading-tight"
                variants={fadeInUp}
              >
                La tecnología que{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                  define el futuro
                </span>
                , hoy
              </motion.h1>
              <motion.p 
                className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl"
                variants={fadeInUp}
              >
                Descubre la colección más exclusiva de iPhone, MacBook y accesorios premium. Donde la innovación se
                viste de azul.
              </motion.p>
            </div>

            <motion.div className="flex flex-col sm:flex-row gap-4" variants={fadeInUp}>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/shop" className="flex items-center">
                  Descúbrelo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/50 hover:bg-primary/10 font-semibold bg-background/80 backdrop-blur-sm"
              >
                <Link href="/shop/smartphones">Ver iPhone 15 Pro</Link>
              </Button>
            </motion.div>

            <motion.div className="flex flex-wrap items-center gap-6 pt-4" variants={staggerContainer}>
              <motion.div 
                className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm rounded-full px-4 py-2"
                variants={scaleIn}
              >
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Garantía oficial</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm rounded-full px-4 py-2"
                variants={scaleIn}
              >
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Envío express</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm rounded-full px-4 py-2"
                variants={scaleIn}
              >
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Atención personalizada</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
