import { Reveal } from './Reveal';

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  index?: string;
};

export function SectionHeader({ eyebrow, title, lead, align = 'left', index }: Props) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <header className={`${alignment} max-w-3xl ${align === 'center' ? '' : ''} mb-16 md:mb-24`}>
      <Reveal>
        <div className="flex items-center gap-4 mb-8">
          {index && <span className="font-mono text-xs text-ash tracking-widest">{index}</span>}
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-display text-display-md text-pretty display-treatment">
          {title.split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h2>
      </Reveal>

      {lead && (
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-prose text-graphite text-lg leading-relaxed">{lead}</p>
        </Reveal>
      )}
    </header>
  );
}
