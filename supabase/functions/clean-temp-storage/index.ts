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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🧹 Limpando arquivos temporários do Storage...');

    // Listar todos os arquivos em temp-imports/
    const { data: files, error: listError } = await supabase.storage
      .from('corpus')
      .list('temp-imports', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (listError) {
      console.error('❌ Erro ao listar arquivos:', listError);
      throw listError;
    }

    console.log(`📂 Encontrados ${files?.length || 0} arquivos`);

    // Filtrar apenas arquivos .json do Gutenberg
    const gutenbergFiles = files?.filter(f => 
      f.name.startsWith('gutenberg-') && f.name.endsWith('.json')
    ) || [];

    console.log(`🎯 Arquivos Gutenberg para deletar: ${gutenbergFiles.length}`);

    if (gutenbergFiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum arquivo temporário encontrado',
          deleted: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deletar arquivos
    const filePaths = gutenbergFiles.map(f => `temp-imports/${f.name}`);
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from('corpus')
      .remove(filePaths);

    if (deleteError) {
      console.error('❌ Erro ao deletar arquivos:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Deletados ${gutenbergFiles.length} arquivos temporários`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${gutenbergFiles.length} arquivos temporários deletados`,
        deleted: gutenbergFiles.length,
        files: gutenbergFiles.map(f => f.name)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro na limpeza:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
