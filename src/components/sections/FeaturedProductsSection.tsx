"use client";

import { motion } from "framer-motion";
import { Smartphone, Laptop, Headphones } from "lucide-react";
import { fadeInUp, staggerContainer, defaultViewport } from "@/components/animations/variants";
import ProductCard from "@/components/common/ProductCard";

const featuredProducts = [
  {
    icon: Smartphone,
    title: "iPhone 15 Pro Max",
    description: "Potencia y precisión en cada detalle. Titanio, cámara profesional y chip A17 Pro.",
    price: "$1,299",
    href: "/shop/smartphones"
  },
  {
    icon: Laptop,
    title: "MacBook Pro M3",
    description: "Rendimiento extremo para profesionales. Chip M3, pantalla Liquid Retina XDR.",
    price: "$1,999",
    href: "/shop/laptops"
  },
  {
    icon: Headphones,
    title: "AirPods Pro 2",
    description: "Audio espacial personalizado. Cancelación activa de ruido de nueva generación.",
    price: "$249",
    href: "/shop/accesorios"
  }
];

export default function FeaturedProductsSection() {
  return (
    <motion.section 
      className="py-16"
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">Productos Destacados</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Selección premium de los dispositivos más innovadores del mercado
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={staggerContainer}>
          {featuredProducts.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
