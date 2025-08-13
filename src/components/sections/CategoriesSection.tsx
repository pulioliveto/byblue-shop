"use client";

import { motion } from "framer-motion";
import { Smartphone, Laptop, Headphones } from "lucide-react";
import { fadeInUp, fadeInLeft, fadeInRight, scaleIn, staggerContainer, defaultViewport } from "@/components/animations/variants";
import CategoryCard from "@/components/common/CategoryCard";

const categories = [
  {
    icon: Smartphone,
    title: "Smartphones",
    description: "iPhone, Samsung, Xiaomi",
    href: "/shop/smartphones",
    variants: fadeInLeft
  },
  {
    icon: Laptop,
    title: "Laptops",
    description: "MacBook, Dell, HP",
    href: "/shop/laptops",
    variants: scaleIn
  },
  {
    icon: Headphones,
    title: "Accesorios",
    description: "AirPods, Cargadores, Fundas",
    href: "/shop/accesorios",
    variants: fadeInRight
  }
];

export default function CategoriesSection() {
  return (
    <motion.section 
      className="py-16 bg-gradient-to-r from-secondary/50 to-transparent"
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">Explora por Categoría</h2>
          <p className="text-muted-foreground text-lg">Encuentra exactamente lo que necesitas</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={staggerContainer}>
          {categories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
