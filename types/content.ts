export type Cta = { label: string; href: string };
export type Link = { label: string; href: string };

export interface SiteContent {
  meta: {
    title: string;
    description: string;
    siteUrl: string;
    ogImage: string;
    locale: string;
    themeColor: string;
  };
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    logo: string;
    logoMark: string;
  };
  contact: {
    whatsapp: string;
    whatsappLink: string;
    instagram: string;
    instagramLink: string;
    email: string;
    city: string;
    state: string;
    country: string;
    address: string;
  };
  nav: Link[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    image: string;
    imageAlt: string;
  };
  about: {
    eyebrow: string;
    title: string;
    lead: string;
    paragraphs: string[];
    credentials: { label: string; value: string }[];
    image: string;
    imageAlt: string;
  };
  process: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: { n: string; title: string; body: string }[];
    modalities: { label: string; value: string }[];
  };
  audience: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { title: string; body: string }[];
  };
  differentials: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    items: { quote: string; author: string; role: string }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    eyebrow: string;
    title: string;
    lead: string;
    primary: Cta;
    secondary: Cta;
  };
  footer: {
    tagline: string;
    columns: { title: string; links: Link[] }[];
    legal: string;
    disclaimer: string;
  };
}
