import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ValidationData {
  palavra: string;
  tagset_original: string | null;
  tagset_corrigido: string | null;
  prosody_original: number | null;
  prosody_corrigida: number | null;
  contexto: string | null;
  justificativa: string | null;
  sugestao_novo_ds: string | null;
}

export function useHumanValidation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitValidation = async (validation: ValidationData) => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para validar anotações.'
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('human_validations')
        .insert({
          user_id: user.id,
          palavra: validation.palavra,
          tagset_original: validation.tagset_original,
          tagset_corrigido: validation.tagset_corrigido,
          prosody_original: validation.prosody_original,
          prosody_corrigida: validation.prosody_corrigida,
          contexto: validation.contexto,
          justificativa: validation.justificativa,
          sugestao_novo_ds: validation.sugestao_novo_ds
        });

      if (insertError) throw insertError;

      toast({
        title: 'Validação enviada com sucesso',
        description: `Sua validação para "${validation.palavra}" foi registrada.`
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar validação';
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar validação',
        description: errorMessage
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitValidation,
    isSubmitting
  };
}
