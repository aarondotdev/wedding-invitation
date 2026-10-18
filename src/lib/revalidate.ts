import { revalidateTag } from "next/cache";

// Expire cached pages for these tags. CMS hooks also run outside Next (e.g. `payload run` scripts),
// where there is no cache to expire and revalidateTag throws, so ignore that case.
export function expireTags(...tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Not running inside a Next.js request; nothing is cached here.
    }
  }
}
