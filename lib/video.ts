/**
 * Converte o link colado pelo administrador em um endereço de player embutido.
 * Só aceita provedores conhecidos (evita incorporar páginas arbitrárias).
 * Observação: vídeo "não listado" do YouTube NÃO é privado — quem tiver o link assiste.
 * Para conteúdo exclusivo, prefira Vimeo (com restrição de domínio) ou Bunny Stream.
 */
/** Aceita um link ou o código HTML de incorporação (<iframe src="...">) e devolve só o endereço. */
export function extrairLinkVideo(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const txt = raw.trim();
  if (!txt) return null;
  const m = txt.match(/src\s*=\s*["']([^"']+)["']/i);
  return (m ? m[1] : txt).trim();
}

export function videoEmbedUrl(raw: string | null | undefined): string | null {
  const link = extrairLinkVideo(raw);
  if (!link) return null;
  let u: URL;
  try { u = new URL(link); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'player.vimeo.com' && /^\/video\/\d+/.test(u.pathname)) return u.toString();
  if (host === 'vimeo.com') {
    const m = u.pathname.match(/\/(\d+)/);
    const h = u.pathname.match(/\/\d+\/([a-z0-9]+)/i); // vídeos com hash de privacidade
    return m ? `https://player.vimeo.com/video/${m[1]}${h ? `?h=${h[1]}` : ''}` : null;
  }
  if ((host === 'iframe.mediadelivery.net' || host === 'player.mediadelivery.net') && /^\/(embed|play)\/\d+\/[\w-]+/.test(u.pathname)) {
    // Mantém só o caminho; sem autoplay, para o vídeo não tocar sozinho ao abrir o post.
    return `https://${host}${u.pathname.replace(/^\/play\//, '/embed/')}?autoplay=false&preload=false`;
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const sh = u.pathname.match(/^\/shorts\/([\w-]{11})/);
    if (sh) return `https://www.youtube-nocookie.com/embed/${sh[1]}`;
    const id = u.searchParams.get('v');
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  return null;
}
