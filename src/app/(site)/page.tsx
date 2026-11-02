import { notFound } from "next/navigation";

// Always "not found": skip the dev-only instant-navigation check, which treats the 404 as a render error.
export const instant = false;

// The site is only for invited guests: the bare address shows "page not found".
// Guests open their personal link, /i/[code].
export default function Home() {
  notFound();
}
