'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeletePet } from "@/lib/hooks/usePetsMutations"; // Importar el hook de mutación
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from "sonner"; // Para feedback adicional si es necesario

interface DeletePetButtonProps {
  petId: number;
}

export default function DeletePetButton({ petId }: DeletePetButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { mutate: deletePetMutation, isPending } = useDeletePet(); // Obtener la función de mutación y el estado pendiente

  const handleDelete = () => {
    setIsDeleting(true); // Marcar inicio de eliminación
    deletePetMutation(petId, {
      onSuccess: () => {
        // El toast de éxito ya está en el hook useDeletePet
        // Redirigir al usuario a la página principal después de eliminar
        router.push('/');
        router.refresh(); // Refrescar para asegurar que la lista se actualice
      },
      onError: (error) => {
        // El toast de error ya está en useDeletePet
        // Podríamos mostrar info adicional aquí si quisiéramos
        setIsDeleting(false); // Desmarcar si hubo error
      },
      // onSettled se ejecuta después de onSuccess o onError
      onSettled: () => {
        // setIsDeleting(false); // Podríamos moverlo aquí si quisiéramos que se oculte el estado de carga antes de redirigir
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isPending || isDeleting}>
          {isPending || isDeleting ? "Eliminando..." : "Eliminar Mascota"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente
            los datos de la mascota de nuestros servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            Sí, eliminar mascota
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 