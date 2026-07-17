import type { AffiliatePick } from "@/components/AffiliateCard";

// TODO: replace `?tag=YOURTAG-20` with your Amazon Associates tag,
// or swap in Babylist/Target affiliate URLs.

export const HOME_PICKS: AffiliatePick[] = [
  {
    title: "Postpartum recovery kit",
    vendor: "Amazon",
    price: "$32",
    blurb: "Padsicles, peri bottle, witch hazel — first-week comfort.",
    url: "https://www.amazon.com/s?k=postpartum+recovery+kit&tag=YOURTAG-20",
    emoji: "💗",
  },
  {
    title: "White noise machine",
    vendor: "Amazon",
    price: "$22",
    blurb: "Steady sound to smooth out nap and bedtime transitions.",
    url: "https://www.amazon.com/s?k=white+noise+machine+baby&tag=YOURTAG-20",
    emoji: "🌙",
  },
];

export const TRACK_PICKS: AffiliatePick[] = [
  {
    title: "Digital baby thermometer",
    vendor: "Amazon",
    price: "$16",
    blurb: "Fast, accurate reads for those middle-of-the-night checks.",
    url: "https://www.amazon.com/s?k=digital+baby+thermometer&tag=YOURTAG-20",
    emoji: "🌡️",
  },
  {
    title: "Wearable breast pump",
    vendor: "Amazon",
    price: "$149",
    blurb: "Hands-free pumping that fits inside your normal bra.",
    url: "https://www.amazon.com/s?k=wearable+breast+pump&tag=YOURTAG-20",
    emoji: "🍼",
  },
];

export const JOURNEY_PICKS_BY_WEEK: Record<string, AffiliatePick[]> = {
  "Week 24": [
    {
      title: "Belly support band",
      vendor: "Amazon",
      price: "$24",
      blurb: "Eases lower-back pressure as bump grows.",
      url: "https://www.amazon.com/s?k=maternity+belly+band&tag=YOURTAG-20",
      emoji: "🤰",
    },
    {
      title: "Prenatal yoga class",
      vendor: "Glo",
      price: "$18/mo",
      blurb: "On-demand classes tailored to each trimester.",
      url: "https://www.glo.com/?ref=YOURREF",
      emoji: "🧘",
    },
  ],
  "Week 28": [
    {
      title: "Kick counter journal",
      vendor: "Amazon",
      price: "$12",
      blurb: "Track daily fetal movement patterns.",
      url: "https://www.amazon.com/s?k=kick+count+journal&tag=YOURTAG-20",
      emoji: "📓",
    },
  ],
  "Week 32": [
    {
      title: "Hospital bag essentials kit",
      vendor: "Babylist",
      price: "$89",
      blurb: "Curated bundle: robe, slippers, toiletries, going-home outfit.",
      url: "https://www.babylist.com/store/hospital-bag?ref=YOURREF",
      emoji: "🎒",
    },
    {
      title: "Newborn diaper starter pack",
      vendor: "Amazon",
      price: "$28",
      blurb: "Size N + wipes — first two weeks covered.",
      url: "https://www.amazon.com/s?k=newborn+diapers+size+n&tag=YOURTAG-20",
      emoji: "🍼",
    },
  ],
  "Week 36": [
    {
      title: "Nursing pillow",
      vendor: "Amazon",
      price: "$45",
      blurb: "Supports baby & saves your shoulders during feeds.",
      url: "https://www.amazon.com/s?k=nursing+pillow&tag=YOURTAG-20",
      emoji: "🛋️",
    },
    {
      title: "Baby registry",
      vendor: "Babylist",
      price: "Free",
      blurb: "Add gifts from any store into one shareable list.",
      url: "https://www.babylist.com/?ref=YOURREF",
      emoji: "🎁",
    },
  ],
};

export type ShopSection = {
  id: string;
  title: string;
  picks: AffiliatePick[];
};

export const SHOP_SECTIONS: ShopSection[] = [
  {
    id: "pregnancy",
    title: "Pregnancy essentials",
    picks: JOURNEY_PICKS_BY_WEEK["Week 24"].concat(JOURNEY_PICKS_BY_WEEK["Week 28"]),
  },
  {
    id: "hospital-bag",
    title: "Hospital bag & newborn",
    picks: JOURNEY_PICKS_BY_WEEK["Week 32"],
  },
  {
    id: "postpartum",
    title: "Postpartum recovery",
    picks: HOME_PICKS.filter((p) => p.title === "Postpartum recovery kit").concat(
      JOURNEY_PICKS_BY_WEEK["Week 36"].filter((p) => p.title === "Nursing pillow"),
    ),
  },
  {
    id: "sleep",
    title: "Sleep",
    picks: HOME_PICKS.filter((p) => p.title === "White noise machine"),
  },
  {
    id: "health-tracking",
    title: "Health & tracking gear",
    picks: TRACK_PICKS,
  },
  {
    id: "planning",
    title: "Planning & registry",
    picks: JOURNEY_PICKS_BY_WEEK["Week 36"].filter((p) => p.title === "Baby registry"),
  },
];
