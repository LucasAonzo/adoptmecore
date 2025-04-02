import React from 'react';

// Este layout aplica específicamente a las rutas dentro de /chat
// No necesita importar Navbar o Providers si ya están en el layout raíz,
// a menos que quieras una estructura completamente diferente para el chat.
// Asumiendo que queremos la misma estructura general pero con <main> diferente:

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // La estructura que envuelve a {children} aquí define cómo se renderiza
  // el contenido DENTRO del <main> del layout raíz.
  // SIN EMBARGO, para controlar el overflow del <main> específicamente para
  // esta ruta, necesitamos aplicar la clase aquí.
  // Next.js no permite modificar directamente el <main> del layout padre.
  
  // ENFOQUE CORRECTO: Envolver el children con un div que simule el layout deseado.
  // El <main> del layout padre seguirá siendo flex-1.
  // Este div interno controlará el alto y el overflow para el contenido del chat.
  return (
    // Este div ocupa el 100% del alto del <main> padre (que es flex-1)
    // y aplica el flex-col y overflow-hidden necesarios para el chat.
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {children}
      {/* Si necesitas elementos adicionales específicos del layout de chat,
          irían aquí, fuera del {children} que representa la page.tsx */}
    </div>
  );
} 