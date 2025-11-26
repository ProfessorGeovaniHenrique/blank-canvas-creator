-- =====================================================
-- HIERARQUIA COMPLETA: OBJETOS E ARTEFATOS (OA)
-- 51 novos registros: 6 N2 + 18 N3 + 27 N4
-- =====================================================

BEGIN;

-- =====================================================
-- N2: 6 CATEGORIAS PRINCIPAIS
-- =====================================================

INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
-- 1. Ferramentas e Equipamentos
('OA.FER', 'Ferramentas e Equipamentos', 'Instrumentos utilizados para realizar um trabalho, consertar algo ou construir, desde os mais simples aos mais complexos.', 2, 'OA', 'ativo', ARRAY['martelo', 'serrote', 'laço', 'sela', 'arado', 'enxada', 'régua', 'balança', 'motor', 'furadeira']),

-- 2. Utensílios e Mobiliário Doméstico
('OA.DOM', 'Utensílios e Mobiliário Doméstico', 'Objetos que compõem o ambiente de uma casa, relacionados à moradia, alimentação e decoração.', 2, 'OA', 'ativo', ARRAY['cadeira', 'mesa', 'cama', 'armário', 'panela', 'prato', 'copo', 'cuia', 'vela', 'espelho']),

-- 3. Arte, Lazer e Comunicação
('OA.ART', 'Arte, Lazer e Comunicação', 'Objetos cujo propósito principal é o entretenimento, a expressão artística ou a comunicação.', 2, 'OA', 'ativo', ARRAY['violão', 'viola', 'gaita', 'tambor', 'xadrez', 'baralho', 'bola', 'caneta', 'livro', 'jornal', 'rádio']),

-- 4. Recipientes e Embalagens
('OA.REC', 'Recipientes e Embalagens', 'Objetos cuja função primária é conter, armazenar ou transportar outros itens.', 2, 'OA', 'ativo', ARRAY['caixa', 'garrafa', 'barril', 'saco', 'sacola', 'mala', 'mochila', 'alforje']),

-- 5. Documentos e Símbolos de Valor
('OA.DOC', 'Documentos e Símbolos de Valor', 'Artefatos que representam informação formal, identidade ou valor econômico.', 2, 'OA', 'ativo', ARRAY['certidão', 'identidade', 'passaporte', 'escritura', 'moeda', 'nota', 'cheque', 'anel', 'colar']),

-- 6. Armas e Equipamentos de Defesa
('OA.ARM', 'Armas e Equipamentos de Defesa', 'Instrumentos criados para caça, combate ou proteção pessoal.', 2, 'OA', 'ativo', ARRAY['faca', 'espada', 'lança', 'boleadeira', 'espingarda', 'revólver', 'escudo', 'armadura']);

-- =====================================================
-- N3: 18 SUBCATEGORIAS
-- =====================================================

-- Sob OA.FER (Ferramentas e Equipamentos)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.FER.MAN', 'Ferramentas Manuais', 'Instrumentos que dependem da força humana para operar.', 3, 'OA.FER', 'ativo', ARRAY['martelo', 'serrote', 'chave de fenda', 'facão', 'machado', 'tesoura']),
('OA.FER.RUR', 'Equipamentos de Trabalho Rural', 'Instrumentos e equipamentos específicos da lida no campo (agropecuária).', 3, 'OA.FER', 'ativo', ARRAY['arado', 'enxada', 'foice', 'laço', 'sela', 'freio', 'espora']),
('OA.FER.MEC', 'Equipamentos Mecânicos e de Medição', 'Aparelhos com maior complexidade técnica.', 3, 'OA.FER', 'ativo', ARRAY['régua', 'trena', 'balança', 'relógio', 'motor', 'furadeira']);

-- Sob OA.DOM (Utensílios e Mobiliário Doméstico)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOM.MOB', 'Mobiliário', 'Peças de grande porte que estruturam os cômodos de uma casa.', 3, 'OA.DOM', 'ativo', ARRAY['cadeira', 'banco', 'sofá', 'cama', 'rede', 'armário', 'mesa', 'balcão']),
('OA.DOM.COZ', 'Utensílios de Cozinha e Alimentação', 'Objetos usados para preparar, servir e consumir alimentos.', 3, 'OA.DOM', 'ativo', ARRAY['panela', 'frigideira', 'caldeirão', 'faca', 'prato', 'copo', 'cuia', 'chaleira']),
('OA.DOM.DEC', 'Itens de Decoração e Iluminação', 'Objetos que adornam ou iluminam o ambiente.', 3, 'OA.DOM', 'ativo', ARRAY['lâmpada', 'vela', 'candeeiro', 'quadro', 'vaso', 'espelho', 'cortina', 'tapete']);

-- Sob OA.ART (Arte, Lazer e Comunicação)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.ART.MUS', 'Instrumentos Musicais', 'Aparelhos criados para produzir música.', 3, 'OA.ART', 'ativo', ARRAY['violão', 'viola', 'violino', 'gaita', 'flauta', 'tambor', 'pandeiro']),
('OA.ART.LAZ', 'Objetos de Lazer e Jogos', 'Itens utilizados para diversão, jogos e passatempos.', 3, 'OA.ART', 'ativo', ARRAY['xadrez', 'baralho', 'dominó', 'boneca', 'bola', 'pipa']),
('OA.ART.ESC', 'Materiais de Arte e Escrita', 'Suportes e ferramentas para expressão visual ou escrita.', 3, 'OA.ART', 'ativo', ARRAY['caneta', 'lápis', 'pincel', 'papel', 'caderno', 'tela']),
('OA.ART.COM', 'Meios de Comunicação (Físicos)', 'Objetos que armazenam ou transmitem informação.', 3, 'OA.ART', 'ativo', ARRAY['livro', 'jornal', 'revista', 'carta', 'rádio', 'telefone', 'computador']);

-- Sob OA.REC (Recipientes e Embalagens)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.REC.ARM', 'Recipientes de Armazenamento', 'Usados para guardar materiais, geralmente de forma estática.', 3, 'OA.REC', 'ativo', ARRAY['caixa', 'pote', 'garrafa', 'barril', 'saco', 'bolsa']),
('OA.REC.TRA', 'Equipamentos de Transporte de Carga', 'Objetos projetados para carregar pertences ou mercadorias em deslocamento.', 3, 'OA.REC', 'ativo', ARRAY['mala', 'mochila', 'alforje', 'maleta']);

-- Sob OA.DOC (Documentos e Símbolos de Valor)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOC.OFI', 'Documentos Oficiais e Pessoais', 'Papéis que registram fatos, identidades ou propriedades.', 3, 'OA.DOC', 'ativo', ARRAY['certidão', 'identidade', 'passaporte', 'escritura', 'diploma']),
('OA.DOC.VAL', 'Símbolos de Valor e Troca', 'Objetos que representam riqueza ou poder de compra.', 3, 'OA.DOC', 'ativo', ARRAY['moeda', 'nota', 'cheque', 'anel', 'colar', 'brinco']);

-- Sob OA.ARM (Armas e Equipamentos de Defesa)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.ARM.BRA', 'Armas Brancas (Corpo a Corpo)', 'Armas que utilizam a força do portador e o contato direto.', 3, 'OA.ARM', 'ativo', ARRAY['faca', 'adaga', 'espada', 'punhal', 'lança', 'boleadeira']),
('OA.ARM.FOG', 'Armas de Fogo (À Distância)', 'Armas que utilizam uma explosão para propelir um projétil.', 3, 'OA.ARM', 'ativo', ARRAY['espingarda', 'garrucha', 'revólver', 'pistola', 'fuzil']),
('OA.ARM.PRO', 'Equipamentos de Proteção', 'Itens usados para defesa contra ataques.', 3, 'OA.ARM', 'ativo', ARRAY['escudo', 'armadura', 'capacete']);

-- =====================================================
-- N4: 27 CATEGORIAS ESPECÍFICAS
-- =====================================================

-- Sob OA.FER.MAN (Ferramentas Manuais)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.FER.MAN.CON', 'Para Construção e Reparo', 'Ferramentas manuais para construir e consertar.', 4, 'OA.FER.MAN', 'ativo', ARRAY['martelo', 'serrote', 'chave de fenda', 'prego', 'parafuso', 'alicate']),
('OA.FER.MAN.COR', 'Para Corte', 'Ferramentas manuais para cortar materiais.', 4, 'OA.FER.MAN', 'ativo', ARRAY['facão', 'machado', 'tesoura', 'canivete', 'faca']);

-- Sob OA.FER.RUR (Equipamentos de Trabalho Rural)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.FER.RUR.AGR', 'Para Agricultura', 'Equipamentos rurais específicos para cultivo.', 4, 'OA.FER.RUR', 'ativo', ARRAY['arado', 'enxada', 'foice', 'colheitadeira', 'trator']),
('OA.FER.RUR.PEC', 'Para Pecuária e Montaria', 'Equipamentos rurais para lida com gado e cavalos.', 4, 'OA.FER.RUR', 'ativo', ARRAY['laço', 'sela', 'freio', 'rédea', 'espora', 'marca', 'boleadeira']);

-- Sob OA.FER.MEC (Equipamentos Mecânicos e de Medição)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.FER.MEC.MED', 'De Medição', 'Instrumentos para medir dimensões, peso, temperatura, tempo.', 4, 'OA.FER.MEC', 'ativo', ARRAY['régua', 'trena', 'balança', 'termômetro', 'relógio', 'cronômetro']),
('OA.FER.MEC.ELE', 'Mecânicos e Elétricos', 'Equipamentos com componentes mecânicos ou elétricos.', 4, 'OA.FER.MEC', 'ativo', ARRAY['motor', 'engrenagem', 'roldana', 'furadeira', 'serra elétrica']);

-- Sob OA.DOM.MOB (Mobiliário)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOM.MOB.SEN', 'Para Sentar e Deitar', 'Móveis para descanso e assento.', 4, 'OA.DOM.MOB', 'ativo', ARRAY['cadeira', 'banco', 'sofá', 'cama', 'rede', 'poltrona']),
('OA.DOM.MOB.ARM', 'Para Armazenar', 'Móveis para guardar objetos.', 4, 'OA.DOM.MOB', 'ativo', ARRAY['armário', 'estante', 'guarda-roupa', 'baú', 'cômoda', 'prateleira']),
('OA.DOM.MOB.SUP', 'Superfícies de Apoio', 'Móveis que servem como superfície horizontal.', 4, 'OA.DOM.MOB', 'ativo', ARRAY['mesa', 'balcão', 'escrivaninha', 'aparador', 'bancada']);

-- Sob OA.DOM.COZ (Utensílios de Cozinha e Alimentação)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOM.COZ.PRE', 'Para Preparo', 'Utensílios para preparar alimentos.', 4, 'OA.DOM.COZ', 'ativo', ARRAY['panela', 'frigideira', 'caldeirão', 'faca de cozinha', 'tábua', 'colher de pau']),
('OA.DOM.COZ.SER', 'Para Servir e Consumir', 'Utensílios para servir e consumir alimentos.', 4, 'OA.DOM.COZ', 'ativo', ARRAY['prato', 'copo', 'talher', 'tigela', 'cuia', 'chaleira', 'bandeja']);

-- Sob OA.DOM.DEC (Itens de Decoração e Iluminação)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOM.DEC.ILU', 'Iluminação', 'Objetos que iluminam o ambiente.', 4, 'OA.DOM.DEC', 'ativo', ARRAY['lâmpada', 'vela', 'candeeiro', 'lamparina', 'lustre', 'abajur']),
('OA.DOM.DEC.DEC', 'Decorativos', 'Objetos que adornam o ambiente.', 4, 'OA.DOM.DEC', 'ativo', ARRAY['quadro', 'vaso', 'espelho', 'cortina', 'tapete', 'estátua', 'planta ornamental']);

-- Sob OA.ART.MUS (Instrumentos Musicais)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.ART.MUS.COR', 'De Corda', 'Instrumentos musicais de corda.', 4, 'OA.ART.MUS', 'ativo', ARRAY['violão', 'viola', 'violino', 'harpa', 'cavaquinho', 'bandolim']),
('OA.ART.MUS.SOP', 'De Sopro', 'Instrumentos musicais de sopro.', 4, 'OA.ART.MUS', 'ativo', ARRAY['gaita', 'flauta', 'clarinete', 'trompete', 'saxofone']),
('OA.ART.MUS.PER', 'De Percussão', 'Instrumentos musicais de percussão.', 4, 'OA.ART.MUS', 'ativo', ARRAY['tambor', 'bumbo', 'pandeiro', 'chocalho', 'agogô']);

-- Sob OA.ART.LAZ (Objetos de Lazer e Jogos)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.ART.LAZ.TAB', 'Jogos de Tabuleiro e Mesa', 'Jogos que se realizam sobre mesa ou tabuleiro.', 4, 'OA.ART.LAZ', 'ativo', ARRAY['xadrez', 'damas', 'baralho', 'dominó', 'dado', 'cartas']),
('OA.ART.LAZ.BRI', 'Brinquedos', 'Objetos para diversão infantil.', 4, 'OA.ART.LAZ', 'ativo', ARRAY['boneca', 'bola', 'pião', 'pipa', 'carrinho', 'peteca']);

-- Sob OA.ART.ESC (Materiais de Arte e Escrita)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.ART.ESC.ESC', 'Para Escrever e Desenhar', 'Instrumentos para escrita e desenho.', 4, 'OA.ART.ESC', 'ativo', ARRAY['caneta', 'lápis', 'pena', 'tinteiro', 'pincel', 'giz']),
('OA.ART.ESC.SUP', 'Suportes', 'Superfícies e materiais para escrita/arte.', 4, 'OA.ART.ESC', 'ativo', ARRAY['papel', 'caderno', 'tela', 'pergaminho', 'quadro-negro']);

-- Sob OA.ART.COM (Meios de Comunicação Físicos)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.ART.COM.IMP', 'Impressos', 'Meios de comunicação em formato impresso.', 4, 'OA.ART.COM', 'ativo', ARRAY['livro', 'jornal', 'revista', 'carta', 'cartaz', 'mapa', 'panfleto']),
('OA.ART.COM.ELE', 'Eletrônicos', 'Meios de comunicação eletrônicos/digitais.', 4, 'OA.ART.COM', 'ativo', ARRAY['rádio', 'telefone', 'televisão', 'computador', 'celular']);

-- Sob OA.REC.ARM (Recipientes de Armazenamento)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.REC.ARM.RIG', 'Rígidos', 'Recipientes de estrutura rígida para armazenamento.', 4, 'OA.REC.ARM', 'ativo', ARRAY['caixa', 'pote', 'garrafa', 'barril', 'frasco', 'jarro', 'lata']),
('OA.REC.ARM.FLE', 'Flexíveis', 'Recipientes de estrutura flexível para armazenamento.', 4, 'OA.REC.ARM', 'ativo', ARRAY['saco', 'sacola', 'bolsa', 'embornal', 'saco de pano']);

-- Sob OA.REC.TRA (Equipamentos de Transporte de Carga)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.REC.TRA.BAG', 'Bagagens', 'Recipientes para transportar pertences em viagens.', 4, 'OA.REC.TRA', 'ativo', ARRAY['mala', 'mochila', 'alforje', 'maleta', 'bolsa de viagem']);

-- Sob OA.DOC.OFI (Documentos Oficiais e Pessoais)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOC.OFI.IDE', 'Identificação e Registro', 'Documentos que comprovam identidade ou registram fatos.', 4, 'OA.DOC.OFI', 'ativo', ARRAY['certidão', 'identidade', 'passaporte', 'escritura', 'diploma', 'carteira']);

-- Sob OA.DOC.VAL (Símbolos de Valor e Troca)
INSERT INTO semantic_tagset (codigo, nome, descricao, nivel_profundidade, categoria_pai, status, exemplos) VALUES
('OA.DOC.VAL.MOE', 'Moeda e Dinheiro Físico', 'Objetos que representam valor monetário.', 4, 'OA.DOC.VAL', 'ativo', ARRAY['moeda', 'nota', 'cédula', 'cheque', 'patacão']),
('OA.DOC.VAL.JOI', 'Joias e Adornos de Valor', 'Objetos de valor pessoal ou econômico usado como adorno.', 4, 'OA.DOC.VAL', 'ativo', ARRAY['anel', 'colar', 'brinco', 'pulseira', 'broche', 'aliança']);

-- =====================================================
-- RECALCULAR HIERARQUIA
-- =====================================================

SELECT calculate_tagset_hierarchy();

COMMIT;

-- =====================================================
-- VALIDAÇÃO FINAL
-- =====================================================

-- Verificar total de registros OA (deve ser 52: 1 N1 + 6 N2 + 18 N3 + 27 N4)
SELECT nivel_profundidade, COUNT(*) as total
FROM semantic_tagset 
WHERE codigo LIKE 'OA%' 
GROUP BY nivel_profundidade 
ORDER BY nivel_profundidade;