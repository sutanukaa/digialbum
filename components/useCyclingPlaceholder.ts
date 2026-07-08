import { useEffect, useState } from "react";

// gently rotates through example titles so a blank field is never intimidating
export const TITLE_IDEAS = [
  "our little scrapbook",
  "the summer of us",
  "3am diner runs",
  "our first road trip",
  "the year we met",
  "everything, all at once",
  "my favourite people",
  "a little love letter",
];

export function useCyclingPlaceholder(items: string[] = TITLE_IDEAS, interval = 2800) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [items.length, interval]);
  return items[i];
}
