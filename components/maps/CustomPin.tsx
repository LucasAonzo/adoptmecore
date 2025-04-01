'use client';

import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface CustomPinProps {
  color?: string;
  IconComponent?: LucideIcon;
  size?: number;
}

export const CustomPin: React.FC<CustomPinProps> = ({
  color = '#EF4444', // Default color (red-500)
  IconComponent,
  size = 36 // Default size in pixels
}) => {
  const iconSize = Math.floor(size * 0.5); // Tamaño del icono interior

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        // El offset negativo mueve el pin hacia arriba para que la punta señale la ubicación
        // Ajustamos el translateY para centrar mejor el icono en el pin
        transform: `translateY(-${size / 2}px)`
      }}
    >
      {/* Cuerpo del Pin (SVG) */}
      <svg
        viewBox="0 0 30 42" // ViewBox ajustado para proporción de pin
        width={size}
        height={size * 1.4} // Ajustar altura para la forma de pin
        fill={color}
        stroke="#ffffff" // Borde blanco
        strokeWidth="1.5"
        className="absolute top-0 left-0 drop-shadow-md" // Sombra ligera
      >
        <path
          d="M15 0C7.82 0 2 5.82 2 13c0 7.75 11 19 13 19s13-11.25 13-19C28 5.82 22.18 0 15 0z"
        />
      </svg>

      {/* Icono Interior (si se proporciona) */}
      {IconComponent && (
        <IconComponent
          color="#ffffff" // Icono blanco
          size={iconSize}
          strokeWidth={2.5}
          // Ajustar la posición relativa del icono para que quede centrado en la parte redonda del pin
          className="relative z-10" 
          // Reducir el desplazamiento vertical negativo para centrar mejor
          style={{ transform: `translateY(-${size * 0.10}px)` }} 
        />
      )}
    </div>
  );
};