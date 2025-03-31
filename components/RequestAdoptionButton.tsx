'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateAdoptionRequest } from '@/lib/hooks/useAdoptionMutations';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RequestAdoptionButtonProps {
  petId: number;
  shelterId?: number | null;
  isUserLoggedIn: boolean;
  canRequest: boolean;
}

export default function RequestAdoptionButton({ petId, shelterId, isUserLoggedIn, canRequest }: RequestAdoptionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const { mutate: createRequest, isPending } = useCreateAdoptionRequest();

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      if (!isUserLoggedIn) {
        toast.error("Debes iniciar sesión para solicitar una adopción.");
        setIsOpen(false);
        return;
      }
      if (!canRequest) {
         toast.warning("No puedes solicitar la adopción de esta mascota.");
         setIsOpen(false);
         return;
      }

      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          throw error || new Error("No se pudo obtener la información del usuario.");
        }
        setUserId(user.id);
        setIsOpen(true);
      } catch (error: any) {
        console.error("Error fetching user for adoption request:", error);
        toast.error("Error al verificar usuario: " + error.message);
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleSubmitRequest = () => {
    if (!userId) {
      toast.error("Error: ID de usuario no encontrado. Intenta abrir el diálogo de nuevo.");
      console.error("handleSubmitRequest called without userId. State:", { userId, isOpen });
      return;
    }

    createRequest(
      { pet_id: petId, user_id: userId, shelter_id: shelterId, notes: notes || null },
      {
        onSuccess: () => {
          setIsOpen(false);
          setNotes('');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={!canRequest || isPending}
          className="w-full sm:w-auto"
        >
          {canRequest ? 'Solicitar Adopción' : isUserLoggedIn ? 'Solicitud no disponible' : 'Iniciar Sesión para Adoptar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Solicitud de Adopción</DialogTitle>
          <DialogDescription>
            Estás a punto de solicitar la adopción de esta mascota. Puedes añadir una nota.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="(Opcional) ¿Por qué serías un buen hogar?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmitRequest} disabled={isPending || !userId}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 