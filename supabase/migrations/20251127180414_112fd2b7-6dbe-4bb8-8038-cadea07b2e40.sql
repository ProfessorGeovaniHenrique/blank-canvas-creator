-- =====================================================
-- REFORMULAÇÃO DO DOMÍNIO SB (SAÚDE E BEM-ESTAR)
-- Versão: v1.9.0
-- Data: 2025-11-27
-- Total: ~38 novos tagsets (4 N2, 12 N3, 22 N4)
-- =====================================================

-- Atualizar descrição do N1 existente
UPDATE semantic_tagset 
SET descricao = 'Agrupa termos relacionados à condição física e mental do ser humano, incluindo doenças, tratamentos, práticas de cuidado, o sistema de saúde e os conceitos de bem-estar e estilo de vida.'
WHERE codigo = 'SB';

-- =====================================================
-- N2: DOENÇA E CONDIÇÕES DE SAÚDE (SB.DOE)
-- =====================================================

INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE', 'Doença e Condições de Saúde', 'Termos que descrevem a ausência de saúde, incluindo patologias, lesões e os sinais que o corpo manifesta.', 'SB', 'SB', 2, ARRAY['gripe', 'febre', 'ferida', 'dor'], 'ativo');

-- N3: Doenças e Patologias
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.PAT', 'Doenças e Patologias', 'Condições anormais que afetam o corpo ou a mente.', 'SB.DOE', 'SB.DOE', 3, ARRAY['diabetes', 'câncer', 'pneumonia'], 'ativo');

-- N4: Doenças Infecciosas
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.PAT.INF', 'Doenças Infecciosas', 'Doenças causadas por agentes patogênicos transmissíveis.', 'SB.DOE.PAT', 'SB.DOE.PAT', 4, ARRAY['gripe', 'resfriado', 'pneumonia', 'dengue', 'malária'], 'ativo');

-- N4: Doenças Crônicas e Degenerativas
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.PAT.CRO', 'Doenças Crônicas e Degenerativas', 'Condições de longa duração que progridem lentamente.', 'SB.DOE.PAT', 'SB.DOE.PAT', 4, ARRAY['diabetes', 'hipertensão', 'câncer', 'artrite'], 'ativo');

-- N3: Lesões e Ferimentos
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.LES', 'Lesões e Ferimentos', 'Danos físicos causados por acidentes ou traumas.', 'SB.DOE', 'SB.DOE', 3, ARRAY['ferida', 'corte', 'fratura'], 'ativo');

-- N4: Tipos de Lesão
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.LES.TIP', 'Tipos de Lesão', 'Classificação de lesões e ferimentos físicos.', 'SB.DOE.LES', 'SB.DOE.LES', 4, ARRAY['ferida', 'corte', 'fratura', 'queimadura', 'contusão', 'torção'], 'ativo');

-- N3: Sintomas e Sinais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.SIN', 'Sintomas e Sinais', 'As manifestações e indicações de uma doença ou lesão.', 'SB.DOE', 'SB.DOE', 3, ARRAY['dor', 'febre', 'tosse'], 'ativo');

-- N4: Manifestações Físicas
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.DOE.SIN.FIS', 'Manifestações Físicas', 'Sinais corporais visíveis ou perceptíveis de condições de saúde.', 'SB.DOE.SIN', 'SB.DOE.SIN', 4, ARRAY['dor', 'febre', 'tosse', 'náusea', 'tontura', 'inchaço', 'cicatriz'], 'ativo');

-- =====================================================
-- N2: TRATAMENTOS E CUIDADOS MÉDICOS (SB.TRA)
-- =====================================================

INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA', 'Tratamentos e Cuidados Médicos', 'Termos relacionados à prática da medicina, aos profissionais e aos métodos para restaurar ou manter a saúde.', 'SB', 'SB', 2, ARRAY['remédio', 'cirurgia', 'hospital', 'médico'], 'ativo');

-- N3: Medicamentos e Terapias
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.MED', 'Medicamentos e Terapias', 'Substâncias e práticas usadas para tratar ou prevenir doenças.', 'SB.TRA', 'SB.TRA', 3, ARRAY['remédio', 'vacina', 'terapia'], 'ativo');

-- N4: Farmacologia
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.MED.FAR', 'Farmacologia', 'Medicamentos e substâncias farmacêuticas.', 'SB.TRA.MED', 'SB.TRA.MED', 4, ARRAY['remédio', 'medicamento', 'pílula', 'xarope', 'pomada', 'vacina', 'injeção'], 'ativo');

-- N4: Terapias e Reabilitação
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.MED.TER', 'Terapias e Reabilitação', 'Tratamentos não farmacológicos para restauração da saúde.', 'SB.TRA.MED', 'SB.TRA.MED', 4, ARRAY['terapia', 'fisioterapia', 'psicoterapia', 'tratamento'], 'ativo');

-- N3: Procedimentos Médicos e Cirúrgicos
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.PRO', 'Procedimentos Médicos e Cirúrgicos', 'Ações e intervenções realizadas por profissionais de saúde.', 'SB.TRA', 'SB.TRA', 3, ARRAY['exame', 'cirurgia', 'consulta'], 'ativo');

-- N4: Diagnóstico e Avaliação
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.PRO.DIA', 'Diagnóstico e Avaliação', 'Procedimentos para identificar condições de saúde.', 'SB.TRA.PRO', 'SB.TRA.PRO', 4, ARRAY['exame', 'diagnóstico', 'consulta', 'avaliação', 'biópsia'], 'ativo');

-- N4: Intervenções Médicas
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.PRO.INT', 'Intervenções Médicas', 'Procedimentos invasivos ou cirúrgicos.', 'SB.TRA.PRO', 'SB.TRA.PRO', 4, ARRAY['cirurgia', 'operação', 'curativo', 'transfusão', 'sutura'], 'ativo');

-- N3: Sistema de Saúde e Profissionais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.SIS', 'Sistema de Saúde e Profissionais', 'As instituições e os indivíduos que fornecem cuidados de saúde.', 'SB.TRA', 'SB.TRA', 3, ARRAY['hospital', 'médico', 'clínica'], 'ativo');

-- N4: Locais de Atendimento
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.SIS.LOC', 'Locais de Atendimento', 'Instituições onde cuidados de saúde são prestados.', 'SB.TRA.SIS', 'SB.TRA.SIS', 4, ARRAY['hospital', 'clínica', 'consultório', 'posto de saúde', 'farmácia'], 'ativo');

-- N4: Profissionais de Saúde
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.TRA.SIS.PRO', 'Profissionais de Saúde', 'Indivíduos qualificados para prestar cuidados médicos.', 'SB.TRA.SIS', 'SB.TRA.SIS', 4, ARRAY['médico', 'doutor', 'enfermeiro', 'cirurgião', 'terapeuta', 'psicólogo'], 'ativo');

-- =====================================================
-- N2: BEM-ESTAR E ESTILO DE VIDA (SB.BEM)
-- =====================================================

INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM', 'Bem-Estar e Estilo de Vida', 'Práticas e conceitos relacionados à manutenção proativa da saúde e à qualidade de vida.', 'SB', 'SB', 2, ARRAY['dieta', 'exercício', 'higiene'], 'ativo');

-- N3: Nutrição e Dieta
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.NUT', 'Nutrição e Dieta', 'A relação entre alimentação e saúde.', 'SB.BEM', 'SB.BEM', 3, ARRAY['nutrição', 'dieta', 'vitamina'], 'ativo');

-- N4: Conceitos Nutricionais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.NUT.CON', 'Conceitos Nutricionais', 'Termos e ideias fundamentais da ciência da nutrição.', 'SB.BEM.NUT', 'SB.BEM.NUT', 4, ARRAY['nutrição', 'dieta', 'vitamina', 'proteína', 'caloria', 'nutriente'], 'ativo');

-- N3: Atividade Física e Exercício
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.FIS', 'Atividade Física e Exercício', 'A prática de movimento corporal para manutenção da saúde.', 'SB.BEM', 'SB.BEM', 3, ARRAY['exercício', 'corrida', 'treino'], 'ativo');

-- N4: Modalidades e Ações
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.FIS.MOD', 'Modalidades e Ações', 'Tipos específicos de atividades físicas e exercícios.', 'SB.BEM.FIS', 'SB.BEM.FIS', 4, ARRAY['exercício', 'esporte', 'corrida', 'caminhada', 'alongamento', 'treino'], 'ativo');

-- N3: Higiene e Cuidados Pessoais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.HIG', 'Higiene e Cuidados Pessoais', 'Práticas de limpeza e cuidado com o corpo para prevenir doenças.', 'SB.BEM', 'SB.BEM', 3, ARRAY['higiene', 'limpeza', 'banho'], 'ativo');

-- N4: Práticas de Higiene
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.HIG.PRA', 'Práticas de Higiene', 'Ações específicas de higienização e cuidado pessoal.', 'SB.BEM.HIG', 'SB.BEM.HIG', 4, ARRAY['higiene', 'limpeza', 'assepsia', 'banho', 'desinfecção'], 'ativo');

-- N3: Descanso e Relaxamento
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.DES', 'Descanso e Relaxamento', 'A importância do repouso para a recuperação física e mental.', 'SB.BEM', 'SB.BEM', 3, ARRAY['descanso', 'repouso', 'relaxamento'], 'ativo');

-- N4: Práticas de Descanso
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.BEM.DES.PRA', 'Práticas de Descanso', 'Ações e métodos para promover o repouso e relaxamento.', 'SB.BEM.DES', 'SB.BEM.DES', 4, ARRAY['descanso', 'repouso', 'relaxamento', 'meditação'], 'ativo');

-- =====================================================
-- N2: SAÚDE MENTAL E PSICOLOGIA (SB.MEN)
-- =====================================================

INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN', 'Saúde Mental e Psicologia', 'Termos específicos do bem-estar psicológico, cognitivo e emocional.', 'SB', 'SB', 2, ARRAY['depressão', 'ansiedade', 'memória'], 'ativo');

-- N3: Transtornos e Condições Psicológicas
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.TRA', 'Transtornos e Condições Psicológicas', 'Condições que afetam o humor, o pensamento e o comportamento.', 'SB.MEN', 'SB.MEN', 3, ARRAY['depressão', 'ansiedade', 'estresse'], 'ativo');

-- N4: Transtornos de Humor e Ansiedade
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.TRA.HUM', 'Transtornos de Humor e Ansiedade', 'Condições psicológicas que afetam o estado emocional.', 'SB.MEN.TRA', 'SB.MEN.TRA', 4, ARRAY['depressão', 'ansiedade', 'pânico', 'fobia'], 'ativo');

-- N4: Estresse e Trauma
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.TRA.EST', 'Estresse e Trauma', 'Condições relacionadas a pressão psicológica e experiências traumáticas.', 'SB.MEN.TRA', 'SB.MEN.TRA', 4, ARRAY['estresse', 'trauma', 'esgotamento'], 'ativo');

-- N3: Estados e Processos Cognitivos
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.COG', 'Estados e Processos Cognitivos', 'As funções e operações da mente.', 'SB.MEN', 'SB.MEN', 3, ARRAY['mente', 'consciência', 'memória'], 'ativo');

-- N4: Funções da Mente
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.COG.FUN', 'Funções da Mente', 'Processos mentais fundamentais e capacidades cognitivas.', 'SB.MEN.COG', 'SB.MEN.COG', 4, ARRAY['mente', 'consciência', 'memória', 'pensamento', 'percepção', 'sonho'], 'ativo');

-- N3: Conceitos Psicológicos
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.PSI', 'Conceitos Psicológicos', 'Ideias e construtos teóricos da psicologia.', 'SB.MEN', 'SB.MEN', 3, ARRAY['personalidade', 'ego', 'identidade'], 'ativo');

-- N4: Construtos da Personalidade
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, tagset_pai, nivel_profundidade, exemplos, status) VALUES
('SB.MEN.PSI.PER', 'Construtos da Personalidade', 'Conceitos teóricos sobre a estrutura da personalidade humana.', 'SB.MEN.PSI', 'SB.MEN.PSI', 4, ARRAY['personalidade', 'ego', 'inconsciente', 'identidade'], 'ativo');

-- =====================================================
-- EXECUTAR RECÁLCULO DE HIERARQUIA
-- =====================================================

SELECT calculate_tagset_hierarchy();