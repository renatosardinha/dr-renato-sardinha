/**
 * Realce editorial: o que estiver entre *asteriscos* vira itálico leve.
 * Ex.: "Cuidado com *presença*." → a palavra "presença" em itálico.
 * Regra de estilo: o itálico fica só na palavra emocional do título, nunca em frases inteiras.
 */
export function Em({ text }: { text: string }) {
  const partes = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.length > 2 && p.startsWith('*') && p.endsWith('*')
          ? <em key={i} className="italic font-light">{p.slice(1, -1)}</em>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}
