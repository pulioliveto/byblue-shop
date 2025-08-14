"use client"

import { useCart } from "@/contexts/CartContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import CheckoutSummary from "@/components/checkout/CheckoutSummary"
import ShippingForm from "@/components/checkout/ShippingForm"
import PaymentSection from "@/components/checkout/PaymentSection"
import TestingHelper from "@/components/TestingHelper"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Truck, CreditCard } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingData, setShippingData] = useState(null)
  const [shippingMethod, setShippingMethod] = useState({ type: "standard", cost: 5000, name: "Envío estándar" })
  const [paymentData, setPaymentData] = useState(null)

  console.log(`=== CHECKOUT PAGE - STEP ${currentStep} ===`)
  console.log('Current shippingMethod:', shippingMethod)
  console.log('Current shippingData:', shippingData)

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (state.items.length === 0) {
      toast.error("Tu carrito está vacío")
      router.push("/shop")
    }
  }, [state.items.length, router])

  const steps = [
    { 
      number: 1, 
      title: "Resumen del pedido", 
      icon: Shield,
      description: "Revisa los productos seleccionados" 
    },
    { 
      number: 2, 
      title: "Información de envío", 
      icon: Truck,
      description: "Completa tus datos de entrega" 
    },
    { 
      number: 3, 
      title: "Pago", 
      icon: CreditCard,
      description: "Finaliza tu compra de forma segura" 
    }
  ]

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleShippingMethodChange = (method: { type: string; cost: number; name: string }) => {
    console.log("=== SHIPPING METHOD CHANGED IMMEDIATELY ===", method)
    setShippingMethod(method)
  }

  const handleShippingSubmit = (data: any) => {
    console.log("=== SHIPPING DATA RECEIVED ===", data)
    console.log("=== CURRENT SHIPPING METHOD ===", shippingMethod)
    setShippingData(data)
    
    // Ya no necesitamos actualizar el shippingMethod aquí porque
    // se actualiza en tiempo real con handleShippingMethodChange
    console.log("=== FINAL SHIPPING METHOD FOR ORDER ===", shippingMethod)
    handleNextStep()
  }

  const handlePaymentSubmit = (data: any) => {
    setPaymentData(data)
    // Aquí implementaremos la lógica de pago con MercadoPago
    console.log("Datos de pago:", data)
    console.log("Datos de envío:", shippingData)
    console.log("Productos:", state.items)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/shop")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a la tienda
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Checkout
              </h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Paso {currentStep} de 3
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center flex-col">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 
                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-px mx-6 transition-all duration-300
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Resumen del pedido
                </h2>
                <CheckoutSummary />
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    Continuar con envío
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Información de envío
                </h2>
                <ShippingForm 
                  onSubmit={handleShippingSubmit} 
                  onShippingMethodChange={handleShippingMethodChange}
                />
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Volver al resumen
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Pago seguro
                </h2>
                <PaymentSection 
                  onSubmit={handlePaymentSubmit}
                  shippingData={shippingData}
                  shippingMethod={shippingMethod}
                  orderTotal={state.total + shippingMethod.cost}
                />
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Volver a envío
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-32">
              <h3 className="text-lg font-semibold mb-4">Resumen de compra</h3>
              
              {/* Items count */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Productos ({state.itemCount})
                </span>
                <span className="font-medium">
                  ${state.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {currentStep >= 2 ? shippingMethod.name : "Envío"}
                </span>
                <span className="font-medium">
                  {currentStep >= 2 ? 
                    `$${shippingMethod.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : 
                    <span className="text-amber-600">Se calculará según ubicación</span>
                  }
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-600 dark:text-gray-400">Impuestos</span>
                <span className="font-medium text-amber-600">
                  Se calcularán al finalizar
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600 dark:text-green-400">
                    ${(state.total + (currentStep >= 2 ? shippingMethod.cost : 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Compra 100% segura y protegida</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <Truck className="w-4 h-4" />
                  <span>Envío gratuito en compras +$50.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Helper para testing - solo en desarrollo */}
      <TestingHelper />
    </div>
  )
}
