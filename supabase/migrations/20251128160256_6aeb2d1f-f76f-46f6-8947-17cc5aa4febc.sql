-- =====================================================
-- Migration: Adicionar Saúde Animal (Veterinária) ao domínio SB
-- Data: 2024-11-28
-- Descrição: Adiciona N2 completo de Saúde Animal com 3 N3s e 10 N4s
-- =====================================================

-- N2: Saúde Animal (Veterinária)
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05',
  'Saúde Animal (Veterinária)',
  'Termos relacionados à condição física e mental de animais, incluindo doenças, tratamentos, práticas de cuidado e o sistema de saúde veterinário.',
  'SB',
  'ativo',
  ARRAY['veterinário', 'vacina animal', 'doença animal', 'tratamento veterinário'],
  2
);

-- N3: Doenças e Condições Animais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.01',
  'Doenças e Condições Animais',
  'Patologias, lesões e sintomas específicos de animais.',
  'SB.05',
  'ativo',
  ARRAY['cinomose', 'fratura', 'manqueira', 'apatia'],
  3
);

-- N4: Patologias Veterinárias
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.01.01',
  'Patologias Veterinárias',
  'Doenças específicas que afetam animais.',
  'SB.05.01',
  'ativo',
  ARRAY['cinomose', 'raiva', 'febre aftosa', 'parvovirose', 'giárdia'],
  4
);

-- N4: Lesões e Ferimentos em Animais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.01.02',
  'Lesões e Ferimentos em Animais',
  'Traumas e ferimentos físicos em animais.',
  'SB.05.01',
  'ativo',
  ARRAY['fratura exposta', 'mordida', 'ferimento por arame'],
  4
);

-- N4: Sintomas em Animais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.01.03',
  'Sintomas em Animais',
  'Sinais clínicos observáveis em animais doentes.',
  'SB.05.01',
  'ativo',
  ARRAY['manqueira', 'perda de pelo', 'apatia', 'vômito', 'diarreia'],
  4
);

-- N3: Tratamentos e Cuidados Veterinários
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.02',
  'Tratamentos e Cuidados Veterinários',
  'Métodos e substâncias usados para restaurar ou manter a saúde animal.',
  'SB.05',
  'ativo',
  ARRAY['vermífugo', 'castração', 'vacinação', 'fisioterapia animal'],
  3
);

-- N4: Medicamentos Veterinários
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.02.01',
  'Medicamentos Veterinários',
  'Substâncias farmacológicas para tratamento de animais.',
  'SB.05.02',
  'ativo',
  ARRAY['vermífugo', 'antipulgas', 'carrapaticida', 'antibiótico de uso veterinário'],
  4
);

-- N4: Procedimentos Veterinários
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.02.02',
  'Procedimentos Veterinários',
  'Intervenções clínicas e cirúrgicas em animais.',
  'SB.05.02',
  'ativo',
  ARRAY['castração', 'cirurgia ortopédica', 'vacinação', 'tosa higiênica', 'inseminação artificial'],
  4
);

-- N4: Terapias e Cuidados de Suporte
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.02.03',
  'Terapias e Cuidados de Suporte',
  'Tratamentos complementares e cuidados para recuperação animal.',
  'SB.05.02',
  'ativo',
  ARRAY['fisioterapia animal', 'acupuntura veterinária', 'fluidoterapia'],
  4
);

-- N3: Sistema de Saúde Animal e Profissionais
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.03',
  'Sistema de Saúde Animal e Profissionais',
  'As instituições e os indivíduos que fornecem cuidados de saúde para animais.',
  'SB.05',
  'ativo',
  ARRAY['clínica veterinária', 'veterinário', 'hospital veterinário'],
  3
);

-- N4: Locais de Atendimento Veterinário
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.03.01',
  'Locais de Atendimento Veterinário',
  'Estabelecimentos onde serviços veterinários são prestados.',
  'SB.05.03',
  'ativo',
  ARRAY['clínica veterinária', 'hospital veterinário', 'consultório veterinário', 'pet shop'],
  4
);

-- N4: Profissionais de Saúde Animal
INSERT INTO semantic_tagset (codigo, nome, descricao, categoria_pai, status, exemplos, nivel_profundidade)
VALUES (
  'SB.05.03.02',
  'Profissionais de Saúde Animal',
  'Pessoas qualificadas para cuidar da saúde de animais.',
  'SB.05.03',
  'ativo',
  ARRAY['veterinário', 'médico veterinário', 'auxiliar veterinário', 'zootecnista'],
  4
);

-- Recalcular hierarquia completa
SELECT calculate_tagset_hierarchy();