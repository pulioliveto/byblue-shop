# ByBlue Shop - Arquitectura de Componentes

## 📁 Estructura de Carpetas

```
src/
├── components/
│   ├── sections/           # Secciones principales de páginas
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedProductsSection.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts        # Exportaciones centralizadas
│   ├── common/             # Componentes reutilizables
│   │   ├── ProductCard.tsx
│   │   └── CategoryCard.tsx
│   ├── animations/         # Configuraciones de animación
│   │   └── variants.ts
│   └── ui/                 # Componentes UI base (Shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
└── app/
    └── page.tsx           # Página principal (refactorizada)
```

## 🎯 Principios de Arquitectura

### 1. **Separación de Responsabilidades**
- **Secciones** (`/sections`): Componentes de página completos
- **Comunes** (`/common`): Componentes reutilizables entre páginas
- **Animaciones** (`/animations`): Configuraciones centralizadas de Framer Motion
- **UI** (`/ui`): Componentes base del design system

### 2. **Reutilización de Código**
- `ProductCard`: Componente genérico para mostrar productos
- `CategoryCard`: Componente genérico para categorías
- `variants.ts`: Animaciones estandarizadas

### 3. **Facilidad de Mantenimiento**
- Un archivo por componente
- Props tipadas con TypeScript
- Exportaciones centralizadas
- Separación de lógica y presentación


## 📦 Componentes Creados

### **HeroSection**
- Sección principal con call-to-action
- Animación de entrada escalonada
- Integra NetworkAnimation
- Badges informativos animados

### **FeaturedProductsSection**
- Grid de productos destacados
- Usa ProductCard reutilizable
- Animaciones de entrada desde viewport

### **CategoriesSection**
- Cards de categorías de productos
- Usa CategoryCard reutilizable
- Animaciones direccionales (izq, centro, der)

### **CTASection**
- Call-to-action final
- Animaciones de texto y botones
- Gradientes dinámicos

### **Footer**
- Footer completo con enlaces
- Animaciones suaves
- Información de marca

## 🎨 Componentes Comunes

### **ProductCard**
```tsx
interface ProductCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  href: string;
  buttonText?: string;
}
```

### **CategoryCard**
```tsx
interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  variants: any;
}
```

## 🎭 Sistema de Animaciones

### **Variantes Disponibles**
- `fadeInUp`: Entrada desde abajo
- `fadeInLeft`: Entrada desde izquierda
- `fadeInRight`: Entrada desde derecha
- `scaleIn`: Crecimiento con escala
- `staggerContainer`: Animación escalonada de hijos

### **Viewports**
- `defaultViewport`: Para secciones principales
- `footerViewport`: Optimizado para footer

## 🔧 Cómo Usar

### **Agregar Nueva Sección**
1. Crear componente en `/sections`
2. Agregar al index.ts
3. Importar en page.tsx

### **Crear Componente Común**
1. Definir interfaces TypeScript
2. Implementar en `/common`
3. Reutilizar donde sea necesario

### **Personalizar Animaciones**
1. Modificar `/animations/variants.ts`
2. Crear nuevas variantes según necesidad
3. Aplicar en componentes

## 📈 Escalabilidad

Esta arquitectura permite:
- ✅ Agregar páginas fácilmente
- ✅ Reutilizar componentes entre páginas
- ✅ Mantener consistencia visual
- ✅ Optimizar performance con lazy loading
- ✅ Testing individual de componentes
- ✅ Desarrollo en equipo sin conflictos

## 🎯 Próximos Pasos

1. Implementar lazy loading para secciones
2. Agregar testing unitario por componente
3. Crear Storybook para documentar componentes
4. Implementar SSR optimizations
5. Añadir analytics por sección
