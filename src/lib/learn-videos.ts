import type { LearnCategory } from "./learn-articles";

export type LearnVideo = {
  id: string;
  category: LearnCategory;
  youtubeId: string;
  title: string;
  source: string;
};

// Curated links to real, existing videos from reputable medical/hospital
// sources — this app hosts no video content of its own, just the link.
export const LEARN_VIDEOS: LearnVideo[] = [
  {
    id: "pregnancy-safe-exercise",
    category: "Pregnancy",
    youtubeId: "rlfozkCy8jw",
    title: "Is It Safe to Exercise While Pregnant? OB-GYN Explains",
    source: "UC Davis Health",
  },
  {
    id: "pregnancy-trimesters-explained",
    category: "Pregnancy",
    youtubeId: "qesYQii5GXw",
    title: "Pregnancy Trimesters Explained",
    source: "UCLA Health",
  },
  {
    id: "feeding-latch-positioning",
    category: "Feeding",
    youtubeId: "qYYTMun-S4I",
    title: "Breastfeeding: Latch & Positioning",
    source: "EvergreenHealth",
  },
  {
    id: "feeding-baby-led-weaning",
    category: "Feeding",
    youtubeId: "N8gLcrPEhB4",
    title: "Pediatrician Explains Baby-Led Weaning: Benefits, Risks, and Getting Started",
    source: "Dr. Kurt & Sarah Bjorkman",
  },
  {
    id: "sleep-abcs-safe-sleep",
    category: "Sleep",
    youtubeId: "T8QNODDhve8",
    title: "The ABCs of Infant Safe Sleep",
    source: "Pediatric health education",
  },
  {
    id: "sleep-swaddle-like-a-pro",
    category: "Sleep",
    youtubeId: "VJB4RdwsM8o",
    title: "Swaddle Your Baby Like a Pro: Pediatrician Tips",
    source: "Dr. Kurt Bjorkman",
  },
  {
    id: "first-aid-choking-baby",
    category: "First aid",
    youtubeId: "4j329wUsl3s",
    title: "Children First Aid: Choking Baby",
    source: "British Red Cross",
  },
  {
    id: "first-aid-fever-when-to-call",
    category: "First aid",
    youtubeId: "O3KshjeKEo8",
    title: "Fever: When to Call Your Child's Pediatrician",
    source: "American Academy of Pediatrics",
  },
];

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}
