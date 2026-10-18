import "server-only";

import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import {
  DEFAULT_SHARE_IMAGE,
  PAGE_TEXT_CACHE_TAG,
  SEO_CACHE_TAG,
  pageTextDefaults,
  seoDefaults,
  storyChapterDefaults,
  type PagePhotos,
  type PageText,
  type StoryChapter,
} from "@/lib/site-content-defaults";
import {
  DETAILS_CACHE_TAG,
  ENTOURAGE_CACHE_TAG,
  detailsDefaults,
  entourageDefaults,
  type Details,
  type Entourage,
  type GalleryPhoto,
  type NameGroup,
} from "@/lib/details-defaults";
import { getWedding, toPhoto } from "@/lib/wedding";

// Saved value if it has text, otherwise the default
const pick = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

// Cached until the "Page text" global is saved in the CMS (its afterChange hook expires the tag).
export async function getPageText(): Promise<PageText & { photos: PagePhotos; chapters: StoryChapter[] }> {
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
    hero: toPhoto(doc.hero?.photo),
    story: toPhoto(doc.story?.photo),
    statement: toPhoto(doc.statement?.photo),
    statementBand: toPhoto(doc.statement?.bandPhoto),
    statementSecondary: toPhoto(doc.statement?.secondaryPhoto),
  };
  // Never saved: show the placeholder chapters. Saved: show exactly what the editor kept (may be none).
  const savedChapters = doc.story?.chapters as Array<{ title?: string; text?: string | null; photo?: unknown }> | undefined;
  const chapters: StoryChapter[] = Array.isArray(savedChapters)
    ? savedChapters.map((c) => ({ title: c.title ?? "", text: c.text ?? "", photo: toPhoto(c.photo) }))
    : storyChapterDefaults.map((c) => ({ ...c, photo: null }));
  return { ...(merged as PageText), photos, chapters };
}

type SavedGroup = { title?: string; names?: Array<{ name?: string }> | null };
const toGroup = (g: SavedGroup): NameGroup => ({
  title: g.title ?? "",
  names: (g.names ?? []).map((n) => n.name ?? "").filter(Boolean),
});

// Cached until "Family & entourage" is saved. A never-saved global shows the placeholder names.
export async function getEntourage(): Promise<Entourage> {
  "use cache";
  cacheLife("max");
  cacheTag(ENTOURAGE_CACHE_TAG);

  const payload = await getPayload({ config });
  const doc = (await payload.findGlobal({ slug: "entourage" })) as unknown as {
    updatedAt?: string;
    title?: string;
    intro?: string | null;
    parents?: SavedGroup[];
    sponsors?: SavedGroup;
    entourage?: SavedGroup[];
  };
  if (!doc.updatedAt) return entourageDefaults;

  return {
    title: pick(doc.title, entourageDefaults.title),
    intro: doc.intro ?? "",
    parents: (doc.parents ?? []).map(toGroup),
    sponsors: toGroup({ title: pick(doc.sponsors?.title, entourageDefaults.sponsors.title), names: doc.sponsors?.names }),
    entourage: (doc.entourage ?? []).map(toGroup),
  };
}

// Cached until "Guest details" is saved (or an image changes).
export async function getDetails(): Promise<Details & { dressCodePhoto: GalleryPhoto | null; galleryPhotos: GalleryPhoto[] }> {
  "use cache";
  cacheLife("max");
  cacheTag(DETAILS_CACHE_TAG);

  const payload = await getPayload({ config });
  const doc = (await payload.findGlobal({ slug: "details", depth: 2 })) as unknown as {
    updatedAt?: string;
    dressCode?: { title?: string; description?: string; note?: string | null; palette?: Array<{ name?: string; color?: string }>; photo?: unknown };
    faq?: { title?: string; intro?: string; items?: Array<{ question?: string; answer?: string }> };
    gallery?: { title?: string; intro?: string; photos?: Array<{ photo?: unknown }> };
  };
  const d = detailsDefaults;
  if (!doc.updatedAt) return { ...d, dressCodePhoto: null, galleryPhotos: [] };

  return {
    dressCode: {
      title: pick(doc.dressCode?.title, d.dressCode.title),
      description: doc.dressCode?.description ?? "",
      note: doc.dressCode?.note ?? "",
      palette: (doc.dressCode?.palette ?? []).map((c) => ({ name: c.name ?? "", color: c.color ?? "#000000" })),
    },
    faq: {
      title: pick(doc.faq?.title, d.faq.title),
      intro: doc.faq?.intro ?? "",
      items: (doc.faq?.items ?? []).map((i) => ({ question: i.question ?? "", answer: i.answer ?? "" })),
    },
    gallery: { title: pick(doc.gallery?.title, d.gallery.title), intro: doc.gallery?.intro ?? "" },
    dressCodePhoto: toPhoto(doc.dressCode?.photo),
    galleryPhotos: (doc.gallery?.photos ?? []).map((p) => toPhoto(p.photo)).filter((p): p is GalleryPhoto => p !== null),
  };
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
