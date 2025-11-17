-- Adicionar política de UPDATE para permitir aprovação de tagsets
-- Necessário para que o TagsetManager possa aprovar/rejeitar tagsets

-- Deletar política antiga se existir
DROP POLICY IF EXISTS "Permitir atualização de status de tagsets" ON semantic_tagset;

-- Criar nova política
CREATE POLICY "Permitir atualização de status de tagsets"
ON semantic_tagset
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Adicionar comentário explicativo
COMMENT ON POLICY "Permitir atualização de status de tagsets" ON semantic_tagset IS 
'Permite que o sistema atualize status e aprovação de tagsets semânticos';