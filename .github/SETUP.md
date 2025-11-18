# ⚙️ Configuração do GitHub Actions

## Secret Necessário

Para que o workflow de auditoria de métricas funcione, você precisa adicionar um secret no GitHub:

1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Nome: `SUPABASE_ANON_KEY`
4. Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d21odXViYnN2Y2xrb3J4cnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDY4OTcsImV4cCI6MjA3ODgyMjg5N30.XFZgYLAG2YLM2YiEsw_aFBamtR1y8llKXYJq5Yq8h64`

## Workflows Disponíveis

### 📊 audit-metrics.yml
- **Quando executa**: A cada push na branch `main` ou manualmente
- **O que faz**: Conta arquivos e linhas de código, envia para o backend
- **Resultado**: Métricas armazenadas na tabela `phase_metrics`

## Teste Manual do Workflow

Para testar o workflow manualmente:

1. Vá em **Actions** no GitHub
2. Selecione o workflow "📊 Audit Project Metrics"
3. Clique em **Run workflow**
4. Escolha a branch (normalmente `main`)
5. Clique em **Run workflow**

## Verificar Resultados

Após a execução, você pode verificar os resultados:

- **Logs do workflow**: Na aba Actions do GitHub
- **Dados no banco**: Consulte a tabela `phase_metrics` no backend
- **Toast na UI**: Sincronização automática exibirá notificação na página Developer History
