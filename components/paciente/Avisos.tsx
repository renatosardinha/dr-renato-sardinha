export function Avisos({ ok, erro }: { ok?: string; erro?: string }) {
  return (
    <>
      {ok && <p className="mb-4 border border-mist bg-ivory p-3 text-sm" role="status">{ok}</p>}
      {erro && <p className="mb-4 border border-terracotta p-3 text-sm text-terracotta" role="alert">{erro}</p>}
    </>
  );
}
