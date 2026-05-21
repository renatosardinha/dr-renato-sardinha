# Dr. Renato Sardinha — Landing Page Editorial

Site institucional autoral. Estética editorial premium, tipografia serifada display, paleta neutra quente, microinterações silenciosas.

**Stack:** Next.js 14 (App Router) · TypeScript · TailwindCSS · Framer Motion.

---

## 1. Instalação

Requisitos: **Node.js 18.17+** (recomendado 20 LTS).

```bash
# instalar dependências
npm install

# rodar em desenvolvimento
npm run dev

# build de produção
npm run build && npm start
```

O site abre em `http://localhost:3000`.

---

## 2. Como editar (sem programador)

**Todo o conteúdo do site mora em um único arquivo:**

```
content/site.json
```

Abra-o com qualquer editor de texto (VS Code, Sublime, até o Bloco de Notas). Edite o que precisar e salve. O site se atualiza automaticamente.

### O que você pode editar lá

| Campo | O que controla |
|---|---|
| `meta` | Título, descrição, OG image, cor do tema (SEO completo) |
| `brand` | Nome, tagline, caminhos de logo |
| `contact` | WhatsApp, Instagram, e-mail, cidade |
| `nav` | Itens do menu de navegação |
| `hero` | Headline, subheadline, CTAs, imagem |
| `about` | Filosofia, parágrafos, credenciais |
| `process` | As 4 etapas do acompanhamento |
| `audience` | Para quem é o trabalho |
| `differentials` | Diferenciais |
| `testimonials` | Depoimentos do carrossel |
| `faq` | Perguntas e respostas |
| `cta` | Bloco final de chamada |
| `footer` | Tagline, colunas, links institucionais |

### Trocar a logo

1. Salve sua logo final como `public/images/logo.svg` (sobrescreva a placeholder).
2. Salve também a versão monograma em `public/images/logo-mark.svg`.
3. Pronto.

> **Dica:** SVG é o ideal porque escala sem perder qualidade. Se você só tem PNG, salve como `logo.png` e altere o caminho em `content/site.json → brand.logo`.

### Trocar imagens

Coloque os arquivos em `public/images/` e atualize os caminhos em `content/site.json`. Recomendado:

- **portrait.jpg** — foto profissional do hero, 1200×1500px (vertical), peso < 200KB
- **about.jpg** — ambiente do consultório, 1200×1200px, peso < 200KB
- **og.jpg** — preview para compartilhamento, 1200×630px

Use [Squoosh](https://squoosh.app) para comprimir antes de subir.

### Adicionar/remover seções

A página principal está em `app/page.tsx`. Para esconder uma seção, comente a linha correspondente:

```tsx
{/* <Testimonials /> */}
```

Para reordenar, basta arrastar as linhas.

---

## 3. Design System

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `bone` | `#F5F1EA` | Fundo principal |
| `ivory` | `#FAF7F2` | Fundos alternados |
| `sand` | `#E8DFD2` | Cartões, divisões |
| `clay` | `#C9B8A1` | Acentos sutis |
| `terracotta` | `#A66E4E` | Detalhes editoriais |
| `umber` | `#6B4F3A` | Hover de marca |
| `ink` | `#1F1B16` | Texto principal, botões |
| `graphite` | `#3D362E` | Texto corpo |
| `ash` | `#8A7F73` | Texto auxiliar |
| `mist` | `#D9D1C5` | Bordas sutis |

### Tipografia

- **Display:** Fraunces (serifa variável, com `opsz` e `SOFT`) — títulos e citações.
- **Sans:** Inter — textos corridos, navegação, UI.
- **Mono:** SF Mono / system — numeração e meta.

Carregadas via `next/font/google` com `display: swap` (sem FOIT, sem layout shift).

### Componentes reutilizáveis

| Componente | Função |
|---|---|
| `<Reveal>` | Animação de entrada com Framer Motion |
| `<SectionHeader>` | Cabeçalho editorial (eyebrow + título + lead) |
| `<Logo>` | Logo SVG vetorial (full ou mark) |
| `.btn-primary` / `.btn-ghost` | Botões editoriais |
| `.editorial-link` | Link com sublinhado que recolhe no hover |
| `.eyebrow` | Sobrenome pequeno em caixa alta |

---

## 4. Estrutura de pastas

```
.
├── app/
│   ├── layout.tsx           # fontes, metadata, JSON-LD
│   ├── page.tsx             # composição da home
│   ├── globals.css          # tokens + base + animações
│   ├── sitemap.ts           # sitemap.xml automático
│   ├── robots.ts            # robots.txt automático
│   ├── not-found.tsx        # 404 editorial
│   ├── privacidade/page.tsx
│   ├── lgpd/page.tsx
│   └── termos/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Logo.tsx
│   ├── Reveal.tsx
│   ├── SectionHeader.tsx
│   ├── WhatsAppFAB.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── Process.tsx
│       ├── Audience.tsx
│       ├── Differentials.tsx
│       ├── Testimonials.tsx
│       ├── FAQ.tsx
│       └── CTAFinal.tsx
├── content/
│   └── site.json            # ← TODO O CONTEÚDO MORA AQUI
├── lib/
│   └── content.ts           # loader tipado
├── public/
│   └── images/              # logo, fotos, OG
├── types/
│   └── content.ts           # tipagem do JSON
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 5. Deploy (recomendado: Vercel)

A forma mais elegante e gratuita:

1. Crie conta em [vercel.com](https://vercel.com) (login com GitHub).
2. Suba este projeto para um repositório no GitHub.
3. No Vercel, clique em **Add New → Project**, selecione o repositório.
4. Vercel detecta Next.js automaticamente. Clique em **Deploy**.
5. Em ~2 minutos, seu site está online.

### Conectar domínio próprio

No painel da Vercel: **Settings → Domains → Add**. Digite `drrenatosardinha.com.br`, copie os registros DNS (A ou CNAME) e configure no seu registrador (Registro.br, GoDaddy, etc.).

### Alternativas

- **Netlify** — fluxo idêntico, ótima alternativa.
- **Cloudflare Pages** — performance excelente, gratuito.

### Atualizações futuras

Sempre que editar `content/site.json` e fizer `git push`, a Vercel rebuilda e publica em segundos. Você pode editar direto pela interface do GitHub se preferir.

---

## 6. SEO — o que já está implementado

- **Metadata API do Next 14** completa: title template, description, keywords.
- **Open Graph + Twitter Cards** para compartilhamento bonito em redes.
- **JSON-LD Schema.org `Physician`** — Google entende que é um site médico.
- **Sitemap.xml + robots.txt** gerados automaticamente.
- **Canonical URL** explícito.
- **Lang `pt-BR`** correto.
- **Fontes otimizadas** com `display: swap` (sem CLS).
- **Lazy loading** de imagens nativo do Next/Image.
- **Acessibilidade** — foco visível, ARIA labels, reduced motion respeitado.

### Próximas otimizações sugeridas

1. **Google Search Console** — verifique a propriedade e envie o sitemap.
2. **Google My Business** — perfil completo para SEO local em São José do Rio Preto.
3. **Google Analytics 4 ou Plausible** — meça tráfego sem invadir privacidade.
4. **Conteúdo editorial** — considere um blog `/escritos` com artigos curtos (3–5 textos baseados em evidência). É o que mais sobe ranking médico local.

---

## 7. Performance

Lighthouse esperado (após deploy):

- **Performance:** 95–100
- **Accessibility:** 95–100
- **Best Practices:** 100
- **SEO:** 100

Dicas para manter:

- Imagens sempre comprimidas e em WebP/AVIF (`next/image` faz isso por você se usar).
- Evite scripts de terceiros (chat widgets, popups) — quebram performance e a estética.

---

## 8. Estratégia SEO inicial (90 dias)

**Mês 1 — Fundação**
- [ ] Deploy + domínio próprio.
- [ ] Google Search Console + Bing Webmaster.
- [ ] Google My Business (perfil médico em São José do Rio Preto).
- [ ] Confirmar que `drrenatosardinha.com.br` aparece quando se busca seu nome.

**Mês 2 — Conteúdo**
- [ ] Publicar 3 textos editoriais curtos (1.500 palavras cada) sobre temas que cruzam seu posicionamento: nutrologia baseada em evidência, saúde mental contemporânea, individualização clínica.
- [ ] Schema.org `Article` em cada texto.

**Mês 3 — Autoridade**
- [ ] Conseguir 3–5 backlinks orgânicos (entrevistas, podcasts, parcerias clínicas).
- [ ] Continuar publicando 1–2 textos/mês.

> Bem feita, essa rotina coloca o nome do site na primeira página do Google em buscas locais ("médico nutrólogo São José do Rio Preto", "psiquiatria evidência Rio Preto") em 6–12 meses.

---

## 9. Sugestões de branding futuro

A landing page é o primeiro tijolo. Para uma marca pessoal coesa, sugiro evoluções:

### Identidade

- **Logo definitiva** — considere desenvolvimento com designer de identidade (não Canva). Pense em variação monograma (RS), assinatura completa e versão para Instagram. Orçamento médio: R$ 3k–8k.
- **Manual de marca** — paleta, tipografia, regras de uso, tom de voz. 8–12 páginas, vira referência para qualquer peça futura.
- **Tipografia da marca** — se quiser distintividade total, licencie uma serifa autoral (ex: GT Sectra, Reckless, Tiempos). Investimento: US$ 200–500.

### Conteúdo

- **Editorial Instagram** — molde o feed com o mesmo design system do site (mesmas fontes, paleta, hierarquia). Use templates em Figma ou Canva Pro.
- **Newsletter** — formato editorial, mensal, com leituras críticas de artigos médicos. Substack ou Beehiiv. Constrói autoridade silenciosa.
- **Podcasts/entrevistas seletivas** — escolha 2–3 por ano, em veículos alinhados ao posicionamento.

### Experiência clínica

- **Materiais impressos** — cartão de visita, papelaria do consultório, prontuário visual. Tudo no mesmo design system.
- **Onboarding do paciente** — PDF editorial com primeiros passos do acompanhamento, entregue no fim da primeira consulta.
- **Comunicação digital** — assinatura de e-mail, modelos de WhatsApp da secretaria, todos coesos.

---

## 10. Recursos e referências

- **Imagens stock editoriais:** [Unsplash](https://unsplash.com), [Pexels](https://pexels.com) (gratuitos), [Stocksy](https://stocksy.com) (premium, vale para fotos do consultório).
- **Compressão:** [Squoosh](https://squoosh.app).
- **Favicon:** [Realfavicongenerator](https://realfavicongenerator.net).
- **Validação Schema:** [Schema Markup Validator](https://validator.schema.org).
- **Teste SEO:** [PageSpeed Insights](https://pagespeed.web.dev).

---

**Construído com critério.**
