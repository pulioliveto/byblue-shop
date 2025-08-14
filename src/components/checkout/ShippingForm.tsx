"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Truck, Clock, User, Phone, Mail } from "lucide-react"
import { toast } from "sonner"

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void
  onShippingMethodChange?: (method: { type: string; cost: number; name: string }) => void
}

export interface ShippingData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  address: {
    street: string
    number: string
    apartment?: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  shippingMethod: 'standard' | 'express' | 'pickup'
  notes?: string
}

const provinces = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
  'Tucumán', 'Ciudad Autónoma de Buenos Aires'
]

const shippingOptions = [
  {
    id: 'standard',
    name: 'Envío Standard',
    description: 'Entrega en 5-7 días hábiles',
    price: 5000,
    icon: Truck
  },
  {
    id: 'express',
    name: 'Envío Express',
    description: 'Entrega en 2-3 días hábiles',
    price: 8000,
    icon: Clock
  },
  {
    id: 'pickup',
    name: 'Retiro en Sucursal',
    description: 'Retira cuando quieras',
    price: 0,
    icon: MapPin
  }
]

export default function ShippingForm({ onSubmit, onShippingMethodChange }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    address: {
      street: '',
      number: '',
      apartment: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Argentina'
    },
    shippingMethod: 'standard',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar información personal
    if (!formData.personalInfo.firstName.trim()) {
      newErrors['firstName'] = 'El nombre es requerido'
    }
    if (!formData.personalInfo.lastName.trim()) {
      newErrors['lastName'] = 'El apellido es requerido'
    }
    if (!formData.personalInfo.email.trim()) {
      newErrors['email'] = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
      newErrors['email'] = 'Email inválido'
    }
    if (!formData.personalInfo.phone.trim()) {
      newErrors['phone'] = 'El teléfono es requerido'
    }

    // Validar dirección (solo si no es retiro en sucursal)
    if (formData.shippingMethod !== 'pickup') {
      if (!formData.address.street.trim()) {
        newErrors['street'] = 'La calle es requerida'
      }
      if (!formData.address.number.trim()) {
        newErrors['number'] = 'El número es requerido'
      }
      if (!formData.address.city.trim()) {
        newErrors['city'] = 'La ciudad es requerida'
      }
      if (!formData.address.province.trim()) {
        newErrors['province'] = 'La provincia es requerida'
      }
      if (!formData.address.postalCode.trim()) {
        newErrors['postalCode'] = 'El código postal es requerido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      console.log("=== SHIPPING FORM DATA ===", formData)
      onSubmit(formData)
      toast.success('Información de envío guardada correctamente')
    } else {
      toast.error('Por favor completa todos los campos requeridos')
    }
  }

  const updatePersonalInfo = (field: keyof ShippingData['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateAddress = (field: keyof ShippingData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleShippingMethodChange = (method: 'standard' | 'express' | 'pickup') => {
    setFormData(prev => ({ ...prev, shippingMethod: method }))
    
    // Notificar al componente padre inmediatamente
    if (onShippingMethodChange) {
      const shippingMethodData = method === 'standard' 
        ? { type: "standard", cost: 5000, name: "Envío estándar" }
        : method === 'express'
        ? { type: "express", cost: 8000, name: "Envío express" }
        : { type: "pickup", cost: 0, name: "Retiro en sucursal" }
      
      onShippingMethodChange(shippingMethodData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Personal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Información Personal
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre *
            </label>
            <Input
              type="text"
              value={formData.personalInfo.firstName}
              onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
              className={errors['firstName'] ? 'border-red-500' : ''}
              placeholder="Ingresa tu nombre"
            />
            {errors['firstName'] && (
              <p className="text-red-500 text-xs mt-1">{errors['firstName']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellido *
            </label>
            <Input
              type="text"
              value={formData.personalInfo.lastName}
              onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
              className={errors['lastName'] ? 'border-red-500' : ''}
              placeholder="Ingresa tu apellido"
            />
            {errors['lastName'] && (
              <p className="text-red-500 text-xs mt-1">{errors['lastName']}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                className={`pl-10 ${errors['email'] ? 'border-red-500' : ''}`}
                placeholder="tu@email.com"
              />
            </div>
            {errors['email'] && (
              <p className="text-red-500 text-xs mt-1">{errors['email']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                className={`pl-10 ${errors['phone'] ? 'border-red-500' : ''}`}
                placeholder="11 1234-5678"
              />
            </div>
            {errors['phone'] && (
              <p className="text-red-500 text-xs mt-1">{errors['phone']}</p>
            )}
          </div>
        </div>
      </div>

      {/* Método de Envío */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Método de Envío
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shippingOptions.map((option) => {
            const Icon = option.icon
            return (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer transition-all ${
                  formData.shippingMethod === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleShippingMethodChange(option.id as 'standard' | 'express' | 'pickup')}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className={`w-6 h-6 ${
                    formData.shippingMethod === option.id
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-sm">{option.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    <p className="text-sm font-bold mt-2">
                      {option.price === 0 ? 'Gratis' : `$${option.price.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Dirección de Envío */}
      {formData.shippingMethod !== 'pickup' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Dirección de Envío
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calle *
              </label>
              <Input
                type="text"
                value={formData.address.street}
                onChange={(e) => updateAddress('street', e.target.value)}
                className={errors['street'] ? 'border-red-500' : ''}
                placeholder="Av. Corrientes"
              />
              {errors['street'] && (
                <p className="text-red-500 text-xs mt-1">{errors['street']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número *
              </label>
              <Input
                type="text"
                value={formData.address.number}
                onChange={(e) => updateAddress('number', e.target.value)}
                className={errors['number'] ? 'border-red-500' : ''}
                placeholder="1234"
              />
              {errors['number'] && (
                <p className="text-red-500 text-xs mt-1">{errors['number']}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Piso/Depto
              </label>
              <Input
                type="text"
                value={formData.address.apartment}
                onChange={(e) => updateAddress('apartment', e.target.value)}
                placeholder="5° B (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ciudad *
              </label>
              <Input
                type="text"
                value={formData.address.city}
                onChange={(e) => updateAddress('city', e.target.value)}
                className={errors['city'] ? 'border-red-500' : ''}
                placeholder="Buenos Aires"
              />
              {errors['city'] && (
                <p className="text-red-500 text-xs mt-1">{errors['city']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código Postal *
              </label>
              <Input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => updateAddress('postalCode', e.target.value)}
                className={errors['postalCode'] ? 'border-red-500' : ''}
                placeholder="1234"
              />
              {errors['postalCode'] && (
                <p className="text-red-500 text-xs mt-1">{errors['postalCode']}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provincia *
              </label>
              <select
                value={formData.address.province}
                onChange={(e) => updateAddress('province', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors['province'] ? 'border-red-500' : ''
                }`}
              >
                <option value="">Selecciona una provincia</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors['province'] && (
                <p className="text-red-500 text-xs mt-1">{errors['province']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                País
              </label>
              <Input
                type="text"
                value={formData.address.country}
                onChange={(e) => updateAddress('country', e.target.value)}
                disabled
                className="bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notas adicionales */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notas adicionales (opcional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          rows={3}
          placeholder="Instrucciones especiales para la entrega..."
        />
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continuar al Pago
        </Button>
      </div>
    </form>
  )
}
