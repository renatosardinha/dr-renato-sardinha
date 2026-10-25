/** Aparece na hora ao trocar de aba, enquanto a página carrega (a navegação parece instantânea). */
export default function Carregando() {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Carregando">
      <div className="h-11 rounded-full bg-sand" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-[18px] border border-mist bg-ivory px-4 py-4">
          <div className="h-5 w-3/4 rounded bg-sand" />
          <div className="mt-2 h-3.5 w-1/3 rounded bg-sand" />
        </div>
      ))}
    </div>
  );
}
