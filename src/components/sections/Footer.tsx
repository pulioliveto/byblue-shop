"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, footerViewport } from "@/components/animations/variants";

const footerSections = [
  {
    title: "Productos",
    links: [
      { href: "/shop", label: "Tienda" },
    ]
  },
  {
    title: "Soporte",
    links: [
      { href: "/contact", label: "Contacto" },
      { href: "/orders", label: "Mis Pedidos" },
      { href: "/contact", label: "Centro de Ayuda" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacidad" },
      { href: "/terms", label: "Términos y Condiciones" }
    ]
  }
];

export default function Footer() {
  return (
    <motion.footer 
      className="border-t border-primary/20 bg-secondary/30"
      initial="hidden"
      whileInView="visible"
      viewport={footerViewport}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8" variants={staggerContainer}>
          {/* Brand Section */}
          <motion.div className="space-y-4" variants={fadeInUp}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BB</span>
              </div>
              <span className="font-heading font-bold text-xl">ByBlue Shop</span>
            </div>
            <p className="text-muted-foreground text-sm">La tecnología que define el futuro, hoy.</p>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div key={section.title} variants={fadeInUp}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="block hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="border-t border-primary/20 mt-8 pt-8 text-center text-sm text-muted-foreground"
          variants={fadeInUp}
        >
          <p>
            &copy; 2025 ByBlue Shop. Desarrollada por{" "}
            <a 
              href="https://emilianooliveto.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors duration-300 underline underline-offset-2"
            >
              Emiliano
            </a>
            .
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
