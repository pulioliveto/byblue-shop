"use client"

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false)
  
  const phoneNumber = "+542281356862"
  const message = "Hola! Me interesa conocer más sobre sus productos."
  const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-8 h-8 text-white" />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30"></div>
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-16 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
            Contactanos por WhatsApp
            <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </a>
    </div>
  )
}
