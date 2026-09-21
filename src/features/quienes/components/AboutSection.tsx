import Image from 'next/image';
import { ShieldCheck, UserCheck, Award } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section className="w-full bg-white py-0">
      <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-[0.98fr_1.02fr] gap-6 lg:gap-0 items-stretch">
        <div className="flex flex-col justify-center py-12 lg:py-16 px-4 sm:px-6 lg:pl-10 lg:pr-6">
          <div className="mb-10 lg:ml-8 lg:-mt-1">
            <p className="text-[#0d3b2d] font-merriweather italic uppercase leading-[0.85] tracking-[-0.06em] text-[clamp(3rem,4vw,6rem)]">
              ¿QUIÉNES
              <span className="block">SOMOS?</span>
            </p>
          </div>

          <p className="max-w-[470px] lg:ml-8 text-[#2f2f2f] text-[0.9rem] sm:text-[0.98rem] leading-[1.6] mb-8 text-justify">
            En <span className="font-semibold text-[#1a1a1a]">Auto Transportes Zoque</span> conectamos comunidades de Chiapas ofreciendo un servicio seguro, puntual y cómodo. Nuestro compromiso es hacer que cada viaje sea una experiencia agradable para nuestros pasajeros.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-[540px] mb-8 mt-6 lg:mt-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center bg-transparent overflow-hidden">
                <Image
                  src="/icons/AboutSegure.png"
                  alt="Seguridad"
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </div>
              <span className="text-[#1d1d1d] text-sm sm:text-base leading-tight font-medium">
                Seguridad <br /> ante todo
              </span>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center bg-transparent">
                <UserCheck className="w-9 h-9 text-[#0d3b2d]" />
              </div>
              <span className="text-[#1d1d1d] text-sm sm:text-base leading-tight font-medium">
                Atención <br /> personalizada
              </span>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center bg-transparent">
                <Award className="w-9 h-9 text-[#0d3b2d]" />
              </div>
              <span className="text-[#1d1d1d] text-sm sm:text-base leading-tight font-medium">
                Compromiso <br /> con Chiapas
              </span>
            </div>
          </div>

          <button className="w-fit inline-flex items-center justify-center px-7 py-3 border-[2px] border-[#c9a227] rounded-xl bg-white text-[#0d3b2d] text-base sm:text-lg font-bold uppercase tracking-tight transition-colors hover:bg-[#c9a227] hover:text-white mt-8 lg:mt-10 lg:ml-8">
            Conoce más
          </button>
        </div>

        <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[760px] xl:h-[820px] overflow-hidden rounded-none border-0 bg-[#e9e2dc] shadow-none ml-auto">
          <Image
            src="/images/zoque1.png"
            alt="Equipo de Auto Transportes Zoque"
            fill
            className="object-cover object-right"
            priority
          />
        </div>
      </div>
    </section>
  );
};