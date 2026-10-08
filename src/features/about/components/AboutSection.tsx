import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal, StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const VALUES = [
  { icon: '/icons/nosotros/AboutSegure.png', label: 'Seguridad', detail: 'ante todo' },
  { icon: '/icons/nosotros/atention1.png', label: 'Atención', detail: 'personalizada' },
  { icon: '/icons/nosotros/compromise1.png', label: 'Compromiso', detail: 'con Chiapas' },
];

export const AboutSection = () => {
  return (
    <section id="nosotros" aria-labelledby="nosotros-titulo" className="w-full overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 items-stretch lg:grid-cols-[0.98fr_1.02fr]">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-10 sm:py-20 lg:py-24 lg:pl-16 lg:pr-12">
          <SectionHeading
            id="nosotros-titulo"
            eyebrow="Nuestra historia"
            title={
              <>
                ¿Quiénes <span className="text-gold-dark">somos?</span>
              </>
            }
          />

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[480px] text-[0.95rem] leading-relaxed text-gray-600 sm:text-base">
              En <span className="font-semibold text-brand">Auto Transportes Zoque</span> conectamos comunidades de
              Chiapas ofreciendo un servicio seguro, puntual y cómodo. Nuestro compromiso es hacer que cada viaje sea una
              experiencia agradable para nuestros pasajeros.
            </p>
          </Reveal>

          <StaggerList delay={0.15} className="mt-10 grid max-w-[540px] grid-cols-3 gap-3 sm:gap-4">
            {VALUES.map(({ icon, label, detail }) => (
              <StaggerItem
                key={label}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-sand px-2 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-zoque-900/5 sm:px-3"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Image src={icon} alt="" width={30} height={30} className="object-contain" />
                </span>
                <span className="text-xs leading-tight text-gray-800 sm:text-sm">
                  <span className="block font-semibold">{label}</span>
                  {detail}
                </span>
              </StaggerItem>
            ))}
          </StaggerList>

          <Reveal delay={0.2} className="mt-10">
            <Link
              href="#destinos"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-zoque-700 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-zoque-600 hover:shadow-lg hover:shadow-zoque-900/20 sm:w-fit"
            >
              Conoce nuestros destinos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <ParallaxImage
          src="/images/nosotros/zoque1.png"
          alt="Equipo de Auto Transportes Zoque frente a la terminal"
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover object-right"
          wrapperClassName="h-[320px] sm:h-[460px] md:h-[540px] lg:h-auto lg:min-h-[720px]"
        />
      </div>
    </section>
  );
};
