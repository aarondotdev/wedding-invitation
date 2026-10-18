import "server-only";

import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import {
  DEFAULT_HERO_PHOTO,
  DEFAULT_SHARE_IMAGE,
  PAGE_TEXT_CACHE_TAG,
  SEO_CACHE_TAG,
  pageTextDefaults,
  seoDefaults,
  type PagePhotos,
  type PageText,
} from "@/lib/site-content-defaults";
import { getWedding, toPhoto } from "@/lib/wedding";

// Saved value if it has text, otherwise the default
const pick = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

// Cached until the "Page text" global is saved in the CMS (its afterChange hook expires the tag).
export async function getPageText(): Promise<PageText & { photos: PagePhotos }> {
  "use cache";
  cacheLife("max");
  cacheTag(PAGE_TEXT_CACHE_TAG);

  const payload = await getPayload({ config });
  const doc = (await payload.findGlobal({ slug: "pageText", depth: 1 })) as unknown as Partial<
    Record<keyof PageText, Record<string, unknown> | null>
  >;

  const merged = {} as Record<string, Record<string, string>>;
  for (const [section, defaults] of Object.entries(pageTextDefaults)) {
    const saved = doc[section as keyof PageText] ?? {};
    merged[section] = Object.fromEntries(
      Object.entries(defaults).map(([key, fallback]) => [key, pick(saved[key], fallback)]),
    );
  }
  const photos: PagePhotos = {
    hero: toPhoto(doc.hero?.photo) ?? DEFAULT_HERO_PHOTO,
    story: toPhoto(doc.story?.photo),
    statement: toPhoto(doc.statement?.photo),
  };
  return { ...(merged as PageText), photos };
}

export type Seo = {
  title: string;
  description: string;
  shareTitle: string;
  shareDescription: string;
  shareImage: { url: string; width: number; height: number; alt: string };
};

// Cached until "Sharing & SEO" or "Wedding details" is saved (automatic wording uses names and date).
export async function getSeo(): Promise<Seo> {
  "use cache";
  cacheLife("max");
  cacheTag(SEO_CACHE_TAG);

  const [payload, wedding] = await Promise.all([getPayload({ config }), getWedding()]);
  const doc = await payload.findGlobal({ slug: "seo", depth: 1 });

  const names = `${wedding.partner1} and ${wedding.partner2}`;
  const title = pick(doc.title, names);
  const description = pick(
    doc.description,
    `Together with their families, ${wedding.partner1} & ${wedding.partner2} invite you to celebrate their wedding on ${wedding.displayDate}.`,
  );

  const upload = typeof doc.shareImage === "object" ? doc.shareImage : null;
  const shareImage = upload?.url
    ? {
        url: upload.url,
        width: upload.width ?? DEFAULT_SHARE_IMAGE.width,
        height: upload.height ?? DEFAULT_SHARE_IMAGE.height,
        alt: upload.alt,
      }
    : { ...DEFAULT_SHARE_IMAGE, alt: pick(doc.shareImageAlt, seoDefaults.shareImageAlt) };

  return {
    title,
    description,
    shareTitle: pick(doc.shareTitle, `You're invited: ${title}`),
    shareDescription: pick(doc.shareDescription, description),
    shareImage,
  };
}
