# 🧪 Guía de Testing - MercadoPago

## Tarjetas de Prueba para Argentina

### ✅ **Pagos Aprobados (Éxito)**
```
Tarjeta: Visa
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Nombre: APRO
```

```
Tarjeta: Mastercard  
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Nombre: APRO
```

### ❌ **Pagos Rechazados (Error)**
```
Tarjeta: Visa
Número: 4013 5406 8274 6260
CVV: 123  
Vencimiento: 11/25
Nombre: FUND (Fondos insuficientes)
```

```
Tarjeta: Mastercard
Número: 5031 4332 1540 6351
CVV: 123
Vencimiento: 11/25  
Nombre: SECU (Código de seguridad inválido)
```

### ⏳ **Pagos Pendientes**
```
Tarjeta: Visa
Número: 4009 1753 3280 7176
CVV: 123
Vencimiento: 11/25
Nombre: PEND
```

## 🏪 **Pagos en Efectivo (Testing)**

Para probar **PagoFácil, Rapipago, etc.**, simplemente:
1. Elige el método de pago en efectivo
2. MercadoPago generará un código de prueba automáticamente
3. En el entorno de testing, puedes simular el pago desde el panel de MercadoPago

## 🔧 **Configuración de Testing**

Asegúrate de tener en tu `.env.local`:

```bash
# Credenciales de TESTING (no producción)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key

# URLs para testing local
NEXTAUTH_URL=http://localhost:3000
```

## 🎯 **Cómo Probar Cada Escenario**

### 1. **Pago Exitoso**
- Usa tarjeta con nombre "APRO"  
- Debería redirigir a `/checkout/success`
- Ver factura de MercadoPago

### 2. **Pago Rechazado** 
- Usa tarjeta con nombre "FUND" o "SECU"
- Debería redirigir a `/checkout/failure` 
- Ver mensaje de error específico

### 3. **Pago Pendiente**
- Usa tarjeta con nombre "PEND"
- Debería redirigir a `/checkout/pending`
- Ver código de pago

### 4. **Pago en Efectivo**
- Selecciona PagoFácil/Rapipago
- Automáticamente va a `/checkout/pending`
- Ver código para el negocio

## 📱 **Panel de Testing de MercadoPago**

1. Ve a: https://mercadopago.com.ar/developers/
2. Entra a tu aplicación de testing
3. Ve a "Pagos" para ver todas las transacciones de prueba
4. Puedes simular webhooks y cambiar estados manualmente

¡Con estas tarjetas podrás probar todos los escenarios posibles!
