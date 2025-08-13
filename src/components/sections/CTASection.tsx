"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, defaultViewport } from "@/components/animations/variants";

export default function CTASection() {
  return (
    <motion.section 
      className="py-20 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={staggerContainer}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div className="space-y-6" variants={staggerContainer}>
          <motion.h2 className="font-heading font-bold text-3xl sm:text-4xl" variants={fadeInUp}>
            ¿Listo para la{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              próxima generación
            </span>
            ?
          </motion.h2>
          <motion.p className="text-xl text-muted-foreground max-w-2xl mx-auto" variants={fadeInUp}>
            Únete a miles de usuarios que ya disfrutan de la mejor tecnología. Ofertas exclusivas y envíos gratis te
            esperan.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeInUp}>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
            >
              <Link href="/auth/signin">Comenzar ahora</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/50 hover:bg-primary/10 font-semibold bg-transparent"
            >
              <Link href="/shop">Explorar productos</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
