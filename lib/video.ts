/**
 * Converte o link colado pelo administrador em um endereço de player embutido.
 * Só aceita provedores conhecidos (evita incorporar páginas arbitrárias).
 * Observação: vídeo "não listado" do YouTube NÃO é privado — quem tiver o link assiste.
 * Para conteúdo exclusivo, prefira Vimeo (com restrição de domínio) ou Bunny Stream.
 */
export function videoEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'player.vimeo.com' && /^\/video\/\d+/.test(u.pathname)) return u.toString();
  if (host === 'vimeo.com') {
    const m = u.pathname.match(/\/(\d+)/);
    const h = u.pathname.match(/\/\d+\/([a-z0-9]+)/i); // vídeos com hash de privacidade
    return m ? `https://player.vimeo.com/video/${m[1]}${h ? `?h=${h[1]}` : ''}` : null;
  }
  if (host === 'iframe.mediadelivery.net' && u.pathname.startsWith('/embed/')) return u.toString();
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = u.searchParams.get('v');
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  return null;
}
