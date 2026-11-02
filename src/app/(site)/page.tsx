import { notFound } from "next/navigation";

// The site is only for invited guests: the bare address shows "page not found".
// Guests open their personal link, /i/[code].
export default function Home() {
  notFound();
}
