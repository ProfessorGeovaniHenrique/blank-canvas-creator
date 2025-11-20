import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { corpusType, projectBaseUrl } = await req.json();
    
    if (!corpusType || !projectBaseUrl) {
      throw new Error('corpusType e projectBaseUrl são obrigatórios');
    }

    console.log(`Iniciando upload do corpus ${corpusType} para o Storage...`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (corpusType === 'gaucho') {
      // Carregar arquivo do public/
      console.log('Carregando gaucho-completo.txt via HTTP...');
      const response = await fetch(`${projectBaseUrl}/corpus/full-text/gaucho-completo.txt`);
      
      if (!response.ok) {
        throw new Error(`Falha ao carregar arquivo: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const fileSize = blob.size;
      console.log(`Arquivo carregado: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

      // Upload para o Storage
      console.log('Fazendo upload para o Storage...');
      const { data, error } = await supabase.storage
        .from('corpus')
        .upload('full-text/gaucho-completo.txt', blob, {
          contentType: 'text/plain',
          upsert: true
        });

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      console.log('Upload concluído com sucesso!', data);

      // Verificar o arquivo no Storage
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('corpus')
        .download('full-text/gaucho-completo.txt');

      if (downloadError) {
        throw new Error(`Erro ao verificar upload: ${downloadError.message}`);
      }

      const verifySize = downloadData.size;
      console.log(`Verificação: arquivo no Storage tem ${verifySize} bytes`);

      if (Math.abs(verifySize - fileSize) > 100) {
        throw new Error(`Tamanho do arquivo difere: original ${fileSize}, storage ${verifySize}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Upload concluído com sucesso',
          fileSize: fileSize,
          storagePath: 'full-text/gaucho-completo.txt',
          verifySize: verifySize
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (corpusType === 'nordestino') {
      // Upload das 3 partes do nordestino
      console.log('Carregando 3 partes do corpus nordestino...');
      
      const parts = [
        'nordestino-parte-01.txt',
        'nordestino-parte-02.txt',
        'nordestino-parte-03.txt'
      ];

      const uploads = [];

      for (const part of parts) {
        console.log(`Processando ${part}...`);
        
        const response = await fetch(`${projectBaseUrl}/corpus/full-text/${part}`);
        if (!response.ok) {
          throw new Error(`Falha ao carregar ${part}: HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const fileSize = blob.size;
        console.log(`${part}: ${fileSize} bytes`);

        const { data, error } = await supabase.storage
          .from('corpus')
          .upload(`full-text/${part}`, blob, {
            contentType: 'text/plain',
            upsert: true
          });

        if (error) {
          throw new Error(`Erro no upload de ${part}: ${error.message}`);
        }

        uploads.push({ file: part, size: fileSize, path: data.path });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Upload de todas as partes concluído',
          uploads: uploads
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      throw new Error(`Tipo de corpus inválido: ${corpusType}`);
    }

  } catch (error) {
    console.error('Erro no upload:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMsg 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
