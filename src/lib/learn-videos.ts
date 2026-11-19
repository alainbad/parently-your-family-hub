import type { LearnCategory } from "./learn-articles";

export type LearnVideo = {
  id: string;
  category: LearnCategory;
  youtubeId: string;
  title: string;
  source: string;
};

// Supplementary publisher videos verified against their original channel.
// Clinical guidance and citations belong in the sourced article cards.
export const LEARN_VIDEOS: LearnVideo[] = [
  {
    id: "feeding-latch-positioning",
    category: "Feeding",
    youtubeId: "qYYTMun-S4I",
    title: "Breastfeeding: Latch & Positioning",
    source: "EvergreenHealth",
  },
];

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}
