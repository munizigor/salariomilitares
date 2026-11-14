// Registra no Google Analytics as simulações feitas nas calculadoras.
//
// O evento leva só categorias (posto, corporação, destino), nunca valores em
// reais nem dados que identifiquem a pessoa. Só é enviado depois que o
// preenchimento fica parado por alguns segundos, e cada combinação conta uma
// vez por visita. Sem consentimento, o modo de consentimento do Google manda
// apenas um sinal anônimo, sem cookies.

type Parametros = Record<string, string | number>;

const ESPERA_MS = 3000;
const enviados = new Set<string>();
let temporizador: ReturnType<typeof setTimeout> | undefined;

export function registrarSimulacao(evento: string, parametros: Parametros) {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    const chave = `${evento}:${JSON.stringify(parametros)}`;
    if (enviados.has(chave)) return;
    enviados.add(chave);
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.('event', evento, parametros);
  }, ESPERA_MS);
}

/** Faixa de dias, para agrupar as missões sem expor a data exata. */
export function faixaDias(dias: number): string {
  if (dias < 30) return 'menos de 30';
  if (dias <= 60) return '30 a 60';
  if (dias <= 90) return '61 a 90';
  if (dias <= 180) return '91 a 180';
  return 'mais de 180';
}
