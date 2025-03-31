import { useState, useEffect } from 'react';

/**
 * Hook simple para debouncear un valor.
 * @param value El valor a debouncear.
 * @param delay El tiempo de espera en milisegundos.
 * @returns El valor debounced.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor debounced
    // después de que el delay haya pasado desde el último cambio de 'value'.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si 'value' o 'delay' cambian antes de que expire.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecutar si value o delay cambian

  return debouncedValue;
} 