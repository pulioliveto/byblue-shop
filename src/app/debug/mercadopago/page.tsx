"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function MercadoPagoDebug() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testMercadoPago = async () => {
    setIsLoading(true)
    try {
      const testItems = [
        {
          id: 'test_item',
          title: 'Producto de Prueba',
          description: 'Test - Test',
          picture_url: '',
          category_id: 'others',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: 100
        }
      ]

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: testItems,
          payer: {
            email: 'test@test.com',
            name: 'Test',
            surname: 'User'
          }
        })
      })

      const data = await response.json()
      setTestResult({
        status: response.status,
        success: response.ok,
        data: data
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">MercadoPago Debug</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test de Configuración</h2>
          <Button 
            onClick={testMercadoPago}
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? 'Probando...' : 'Probar MercadoPago'}
          </Button>
          
          {testResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Variables de Entorno</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>NEXTAUTH_URL:</strong> {process.env.NODE_ENV === 'development' ? window.location.origin : 'Configurado'}
            </div>
            <div>
              <strong>MercadoPago Token:</strong> {process.env.NODE_ENV === 'development' ? 'TEST-****...' : 'Configurado'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
