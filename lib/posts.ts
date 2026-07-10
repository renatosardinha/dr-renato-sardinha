import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

function listMarkdownFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'));
}

/** Lista todos os posts (para a página /blog), do mais recente para o mais antigo. */
export function getAllPosts(): PostMeta[] {
  const posts = listMarkdownFiles().map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug,
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? '',
      excerpt: (data.excerpt as string) ?? '',
      coverImage: (data.coverImage as string) || undefined,
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Lista apenas os slugs (para o Next.js saber quais páginas gerar). */
export function getAllSlugs(): string[] {
  return listMarkdownFiles().map((f) => f.replace(/\.md$/, ''));
}

/** Carrega um post específico, já com o corpo convertido de Markdown para HTML. */
export async function getPostBySlug(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);

  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    coverImage: (data.coverImage as string) || undefined,
    contentHtml: processed.toString(),
  };
}
