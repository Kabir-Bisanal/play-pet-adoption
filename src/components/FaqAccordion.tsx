"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/content";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div className="faq-item" key={item.question}>
            <button
              type="button"
              className="faq-btn"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <span className="faq-chevron">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <div className="faq-panel">{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
