import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFAB } from '@/components/WhatsAppFAB';
import { getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Textos e reflexões sobre medicina baseada em evidência, nutrologia esportiva e saúde mental — por Dr. Renato Sardinha.',
};

function formatDate(date: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-section">
        <div className="container-editorial">
          <span className="eyebrow">Escritos</span>
          <h1 className="mt-6 font-display text-display-lg display-treatment">
            Blog
          </h1>
          <p className="mt-8 max-w-prose text-lg text-graphite leading-relaxed">
            Reflexões e leituras críticas sobre medicina baseada em evidência,
            nutrologia esportiva e saúde mental.
          </p>

          <div className="mt-16 md:mt-20 border-t border-mist">
            {posts.length === 0 && (
              <p className="py-16 text-ash">Nenhum texto publicado ainda.</p>
            )}

            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block border-b border-mist py-10 md:py-12"
              >
                <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-start">
                  {post.coverImage && (
                    <div className="md:col-span-4 relative aspect-[4/3] w-full overflow-hidden border border-mist">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className={post.coverImage ? 'md:col-span-8' : 'md:col-span-12'}>
                    <span className="font-mono text-xs text-ash tracking-widest">
                      {formatDate(post.date)}
                    </span>
                    <h2 className="mt-4 font-display text-2xl md:text-3xl text-ink group-hover:text-umber transition-colors duration-500 display-treatment">
                      {post.title}
                    </h2>
                    <p className="mt-4 text-graphite leading-relaxed max-w-prose">
                      {post.excerpt}
                    </p>
                    <span className="mt-5 inline-flex editorial-link text-sm text-ink">
                      Ler texto completo
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
