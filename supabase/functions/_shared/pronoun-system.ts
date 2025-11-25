/**
 * Sistema Pronominal do Português Brasileiro
 */

export const personalPronouns = {
  retos: {
    p1: ['eu'],
    p2: ['tu', 'você'],
    p3: ['ele', 'ela'],
    p4: ['nós', 'a gente'],
    p5: ['vós', 'vocês'],
    p6: ['eles', 'elas'],
  },
  obliquos: {
    atonos: {
      p1: ['me'],
      p2: ['te', 'lhe'],
      p3: ['o', 'a', 'lhe', 'se'],
      p4: ['nos'],
      p5: ['vos', 'lhes'],
      p6: ['os', 'as', 'lhes', 'se'],
    },
    tonicos: {
      p1: ['mim', 'comigo'],
      p2: ['ti', 'contigo'],
      p3: ['ele', 'ela', 'si', 'consigo'],
      p4: ['nós', 'conosco'],
      p5: ['vós', 'convosco'],
      p6: ['eles', 'elas', 'si', 'consigo'],
    },
  },
  tratamento: ['você', 'senhor', 'senhora'],
};

export const possessivePronouns = {
  p1: ['meu', 'minha', 'meus', 'minhas'],
  p2: ['teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas'],
  p3: ['seu', 'sua', 'seus', 'suas', 'dele', 'dela'],
  p4: ['nosso', 'nossa', 'nossos', 'nossas'],
  p5: ['vosso', 'vossa', 'vossos', 'vossas', 'seus', 'suas'],
  p6: ['seu', 'sua', 'seus', 'suas', 'deles', 'delas'],
};

export const demonstrativePronouns = {
  proximidade: {
    primeira_pessoa: ['este', 'esta', 'estes', 'estas', 'isto'],
    segunda_pessoa: ['esse', 'essa', 'esses', 'essas', 'isso'],
    terceira_pessoa: ['aquele', 'aquela', 'aqueles', 'aquelas', 'aquilo'],
  },
};

export const indefinitePronouns = {
  invariaveis: ['alguém', 'ninguém', 'tudo', 'nada', 'algo', 'outrem', 'cada', 'quem'],
  variaveis: ['algum', 'alguma', 'alguns', 'algumas', 'nenhum', 'nenhuma', 'nenhuns', 'nenhumas', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra', 'outros', 'outras', 'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'poucos', 'poucas', 'certo', 'certa', 'certos', 'certas', 'vário', 'vária', 'vários', 'várias', 'tanto', 'tanta', 'tantos', 'tantas', 'quanto', 'quanta', 'quantos', 'quantas', 'qualquer', 'quaisquer'],
};

export const relativePronouns = {
  invariaveis: ['que', 'quem', 'onde'],
  variaveis: ['o qual', 'a qual', 'os quais', 'as quais', 'cujo', 'cuja', 'cujos', 'cujas', 'quanto', 'quanta', 'quantos', 'quantas'],
};

export const interrogativePronouns = ['que', 'quem', 'qual', 'quanto', 'onde', 'como', 'quando', 'por que'];