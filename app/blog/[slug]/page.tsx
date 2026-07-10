import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFAB } from '@/components/WhatsAppFAB';
import { getAllSlugs, getPostBySlug } from '@/lib/posts';

// Gera todas as páginas de post no momento do build (a partir dos arquivos .md).
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Qualquer slug fora da lista acima retorna 404 direto, sem tentar ler arquivo em tempo real.
export const dynamicParams = false;

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);
    return { title: post.title, description: post.excerpt };
  } catch {
    return { title: 'Texto não encontrado' };
  }
}

function formatDate(date: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: Params) {
  let post;
  try {
    post = await getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-section">
        <div className="container-editorial max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-ash hover:text-ink transition-colors duration-500 mb-12"
          >
            <ArrowLeft strokeWidth={1.2} className="w-4 h-4" />
            Voltar para o blog
          </Link>

          <span className="font-mono text-xs text-ash tracking-widest">
            {formatDate(post.date)}
          </span>

          <h1 className="mt-6 font-display text-display-md display-treatment text-pretty">
            {post.title}
          </h1>

          {/* Imagem de capa — proporção 3:2, moldura fina consistente com o design system */}
          {post.coverImage && (
            <div className="relative aspect-[3/2] w-full overflow-hidden border border-mist mt-10 mb-12">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          )}

          <div
            className="prose-editorial mt-12"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <div className="mt-20 pt-10 border-t border-mist">
            <Link href="/blog" className="editorial-link text-sm">
              ← Ver outros textos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
