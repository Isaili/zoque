"use client";

// Acordeón de preguntas frecuentes basado en FaqAccordion de Vengeance UI
// (https://github.com/Ashutoshx7/VengeanceUI), adaptado a los colores de Zoque y al modo oscuro de la página.
import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
  /** Pregunta abierta al cargar (null = todas cerradas) */
  defaultOpenIndex?: number | null;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { question: "¿Puedo cambiar mi boleto?", answer: "Sí, puedes cambiar tu boleto en taquilla o por WhatsApp." },
];

export function FaqAccordion({ items = DEFAULT_ITEMS, title, defaultOpenIndex = null, className, ...props }: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultOpenIndex);
  const baseId = useId();

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("relative w-full font-sans", className)} {...props}>
      {title && <h2 className="mb-10 text-center text-2xl font-bold text-gray-500 md:text-3xl">{title}</h2>}

      <ul className="m-0 flex w-full list-none flex-col p-0">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const buttonId = `${baseId}-q${index}`;
          const panelId = `${baseId}-a${index}`;
          return (
            <li
              key={item.question}
              className={cn(
                "relative w-full transition-all duration-300 ease-in",
                "border-b-2 border-gray-100 last:border-b-0",
                isActive && "border-b border-gray-200",
              )}
            >
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  className={cn(
                    "relative m-0 flex min-h-[64px] w-full cursor-pointer flex-row items-center justify-start px-4 py-4 pl-14 text-left",
                    "border-l-[6px] font-serif text-lg italic outline-none transition-colors duration-200 md:border-l-[10px] md:text-xl",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold",
                    isActive
                      ? "border-l-zoque-700 bg-sand text-brand dark:border-l-gold"
                      : "border-l-gray-300 bg-transparent text-gray-700 hover:border-l-gold hover:bg-sand/60 hover:text-brand",
                  )}
                  onClick={() => toggleItem(index)}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                >
                  {/* Signo + / − */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 font-sans not-italic leading-none transition-all duration-200 md:left-5",
                      isActive ? "text-[32px] text-gold-dark md:text-[40px]" : "text-[24px] text-gray-400 md:text-[30px]",
                    )}
                  >
                    {isActive ? "−" : "+"}
                  </span>

                  <span className="pr-8">{item.question}</span>

                  {/* Flecha */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-6 block h-2 w-2 border-r-[3px] border-t-[3px] transition-transform duration-200 ease-in-out",
                      isActive ? "rotate-[-44deg] border-gold-dark" : "rotate-[133deg] border-gray-400",
                    )}
                  />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  "grid w-full transition-all duration-300 ease-in-out",
                  "border-l-[6px] md:border-l-[10px]",
                  isActive
                    ? "grid-rows-[1fr] border-l-zoque-700 bg-sand dark:border-l-gold"
                    : "grid-rows-[0fr] border-l-gray-300 bg-transparent",
                )}
              >
                <div className="overflow-hidden" inert={!isActive}>
                  <div className="flex w-full flex-row items-start justify-start px-4 pb-6 pl-14 pt-1 text-base font-normal leading-relaxed text-gray-600 md:text-[1.05rem]">
                    <span>{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
