-- Adicionar novo valor 'user' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';

-- Comentário para documentação
COMMENT ON TYPE public.app_role IS 'Roles do sistema: admin (acesso total), evaluator (validação de análises), user (acesso básico às ferramentas)';