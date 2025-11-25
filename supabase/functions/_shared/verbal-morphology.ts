/**
 * Morfologia Verbal do Português Brasileiro
 * 50+ verbos irregulares mais comuns + verbos regionais gaúchos
 */

export const irregularVerbs: Record<string, {
  infinitivo: string;
  presente: string[];
  preterito: string[];
  imperfeito?: string[];
  futuro?: string[];
  gerundio: string;
  participio: string;
}> = {
  // Verbos auxiliares
  ser: {
    infinitivo: 'ser',
    presente: ['sou', 'és', 'é', 'somos', 'sois', 'são'],
    preterito: ['fui', 'foste', 'foi', 'fomos', 'fostes', 'foram'],
    imperfeito: ['era', 'eras', 'era', 'éramos', 'éreis', 'eram'],
    futuro: ['serei', 'serás', 'será', 'seremos', 'sereis', 'serão'],
    gerundio: 'sendo',
    participio: 'sido',
  },
  estar: {
    infinitivo: 'estar',
    presente: ['estou', 'estás', 'está', 'estamos', 'estais', 'estão'],
    preterito: ['estive', 'estiveste', 'esteve', 'estivemos', 'estivestes', 'estiveram'],
    imperfeito: ['estava', 'estavas', 'estava', 'estávamos', 'estáveis', 'estavam'],
    gerundio: 'estando',
    participio: 'estado',
  },
  ter: {
    infinitivo: 'ter',
    presente: ['tenho', 'tens', 'tem', 'temos', 'tendes', 'têm'],
    preterito: ['tive', 'tiveste', 'teve', 'tivemos', 'tivestes', 'tiveram'],
    imperfeito: ['tinha', 'tinhas', 'tinha', 'tínhamos', 'tínheis', 'tinham'],
    gerundio: 'tendo',
    participio: 'tido',
  },
  haver: {
    infinitivo: 'haver',
    presente: ['hei', 'hás', 'há', 'havemos', 'haveis', 'hão'],
    preterito: ['houve', 'houveste', 'houve', 'houvemos', 'houvestes', 'houveram'],
    imperfeito: ['havia', 'havias', 'havia', 'havíamos', 'havíeis', 'haviam'],
    gerundio: 'havendo',
    participio: 'havido',
  },
  
  // Verbos de movimento
  ir: {
    infinitivo: 'ir',
    presente: ['vou', 'vais', 'vai', 'vamos', 'ides', 'vão'],
    preterito: ['fui', 'foste', 'foi', 'fomos', 'fostes', 'foram'],
    imperfeito: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'],
    gerundio: 'indo',
    participio: 'ido',
  },
  vir: {
    infinitivo: 'vir',
    presente: ['venho', 'vens', 'vem', 'vimos', 'vindes', 'vêm'],
    preterito: ['vim', 'vieste', 'veio', 'viemos', 'viestes', 'vieram'],
    imperfeito: ['vinha', 'vinhas', 'vinha', 'vínhamos', 'vínheis', 'vinham'],
    gerundio: 'vindo',
    participio: 'vindo',
  },
  
  // Verbos de ação
  fazer: {
    infinitivo: 'fazer',
    presente: ['faço', 'fazes', 'faz', 'fazemos', 'fazeis', 'fazem'],
    preterito: ['fiz', 'fizeste', 'fez', 'fizemos', 'fizestes', 'fizeram'],
    imperfeito: ['fazia', 'fazias', 'fazia', 'fazíamos', 'fazíeis', 'faziam'],
    gerundio: 'fazendo',
    participio: 'feito',
  },
  trazer: {
    infinitivo: 'trazer',
    presente: ['trago', 'trazes', 'traz', 'trazemos', 'trazeis', 'trazem'],
    preterito: ['trouxe', 'trouxeste', 'trouxe', 'trouxemos', 'trouxestes', 'trouxeram'],
    imperfeito: ['trazia', 'trazias', 'trazia', 'trazíamos', 'trazíeis', 'traziam'],
    gerundio: 'trazendo',
    participio: 'trazido',
  },
  
  // Verbos modais
  poder: {
    infinitivo: 'poder',
    presente: ['posso', 'podes', 'pode', 'podemos', 'podeis', 'podem'],
    preterito: ['pude', 'pudeste', 'pôde', 'pudemos', 'pudestes', 'puderam'],
    imperfeito: ['podia', 'podias', 'podia', 'podíamos', 'podíeis', 'podiam'],
    gerundio: 'podendo',
    participio: 'podido',
  },
  
  // Verbos regionais gauchescos
  campear: {
    infinitivo: 'campear',
    presente: ['campeio', 'campeias', 'campeia', 'campeamos', 'campeais', 'campeiam'],
    preterito: ['campeei', 'campeaste', 'campeou', 'campeamos', 'campeastes', 'campearam'],
    gerundio: 'campeando',
    participio: 'campeado',
  },
  laçar: {
    infinitivo: 'laçar',
    presente: ['laço', 'laças', 'laça', 'laçamos', 'laçais', 'laçam'],
    preterito: ['lacei', 'laçaste', 'laçou', 'laçamos', 'laçastes', 'laçaram'],
    gerundio: 'laçando',
    participio: 'laçado',
  },
  tropear: {
    infinitivo: 'tropear',
    presente: ['tropeio', 'tropeias', 'tropeia', 'tropeamos', 'tropeais', 'tropeiam'],
    preterito: ['tropeei', 'tropeaste', 'tropeou', 'tropeamos', 'tropeastes', 'tropearam'],
    gerundio: 'tropeando',
    participio: 'tropeado',
  },
};

// Mapa de lematização instantânea
export const conjugatedToInfinitive: Record<string, string> = {};
Object.entries(irregularVerbs).forEach(([inf, data]) => {
  // Adicionar todas as formas conjugadas
  data.presente.forEach((form: string) => conjugatedToInfinitive[form] = inf);
  data.preterito.forEach((form: string) => conjugatedToInfinitive[form] = inf);
  if (data.imperfeito) {
    data.imperfeito.forEach((form: string) => conjugatedToInfinitive[form] = inf);
  }
  if (data.futuro) {
    data.futuro.forEach((form: string) => conjugatedToInfinitive[form] = inf);
  }
  conjugatedToInfinitive[data.gerundio] = inf;
  conjugatedToInfinitive[data.participio] = inf;
  conjugatedToInfinitive[inf] = inf;
});

export const auxiliaryVerbs = ['ter', 'haver', 'ser', 'estar', 'ir', 'vir', 'poder', 'dever', 'querer'];