// Objetos schema.org usados pelas páginas (https://schema.org).

const SITE = 'https://militaresdf.com.br/';

/** Calculadora gratuita, descrita como aplicação web. */
export function calculadora(nome: string, caminho: string, descricao: string) {
  return {
    '@type': 'WebApplication',
    name: nome,
    url: new URL(caminho, SITE).toString(),
    description: descricao,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Qualquer navegador',
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    isPartOf: { '@id': `${SITE}#site` },
  };
}

/** Trilha de navegação a partir da página inicial. */
export function trilha(itens: { nome: string; caminho: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ nome: 'Início', caminho: '/' }, ...itens].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      item: new URL(item.caminho, SITE).toString(),
    })),
  };
}
