import learnPregnancy from "@/assets/learn-pregnancy.jpg";
import learnFeeding from "@/assets/learn-feeding.jpg";
import learnSleep from "@/assets/learn-sleep.jpg";
import learnFirstAid from "@/assets/learn-firstaid.jpg";

export type LearnCategory = "Pregnancy" | "Feeding" | "Sleep" | "First aid";

export const LEARN_CATEGORIES: LearnCategory[] = ["Pregnancy", "Feeding", "Sleep", "First aid"];

export const CATEGORY_PHOTOS: Record<LearnCategory, string> = {
  Pregnancy: learnPregnancy,
  Feeding: learnFeeding,
  Sleep: learnSleep,
  "First aid": learnFirstAid,
};

export type LearnSource = { title: string; url: string };

export type LearnArticle = {
  id: string;
  category: LearnCategory;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  body: string;
  sources: LearnSource[];
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    id: "sleeping-positions-back-pain",
    category: "Pregnancy",
    tag: "Third trimester",
    title: "Sleeping positions in late pregnancy",
    excerpt: "Side-sleeping guidance from 28 weeks, plus ways to get comfortable.",
    readTime: "1 min read",
    body: "From 28 weeks, the NHS recommends going to sleep on your side, left or right. If you wake up on your back, turn onto your side before going back to sleep. Supporting your bump with pillows and placing a pillow between your knees may make side-sleeping more comfortable.",
    sources: [
      {
        title: "NHS: Tiredness and sleep problems in pregnancy",
        url: "https://www.nhs.uk/pregnancy/common-symptoms/tiredness/",
      },
    ],
  },
  {
    id: "iron-rich-meals-15-minutes",
    category: "Pregnancy",
    tag: "Nutrition",
    title: "Simple meals with iron",
    excerpt: "Meal ideas using beans, lentils and iron-fortified cereal.",
    readTime: "1 min read",
    body: "Beans, lentils and iron-fortified cereals are sources of iron. Vitamin C can help your body absorb iron from plant foods. Try a lentil and spinach bowl with bell peppers, beans with a tomato salsa, or iron-fortified cereal with sliced strawberries. Ask your maternity care team about your individual nutritional needs before taking an iron supplement.",
    sources: [
      {
        title: "NIH Office of Dietary Supplements: Pregnancy and dietary supplements",
        url: "https://ods.od.nih.gov/factsheets/Pregnancy-HealthProfessional/",
      },
    ],
  },
  {
    id: "grounding-practice-restless-evenings",
    category: "Pregnancy",
    tag: "Wellbeing",
    title: "A sensory grounding exercise",
    excerpt: "The NHS Inform 5-4-3-2-1 exercise for moments that feel overwhelming.",
    readTime: "1 min read",
    body: "Look around and name **five things you can see**, **four things you can feel**, **three things you can hear**, **two things you can smell**, and **one thing you can taste**. This is a grounding exercise, not a treatment. If anxiety is affecting your daily life, speak with your maternity care team.",
    sources: [
      {
        title: "NHS Inform: Grounding exercises",
        url: "https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises",
      },
      {
        title: "NHS: Anxiety in pregnancy",
        url: "https://www.nhs.uk/pregnancy/mental-health-in-pregnancy-and-after-the-birth/anxiety-in-pregnancy/",
      },
    ],
  },
  {
    id: "getting-a-good-latch",
    category: "Feeding",
    tag: "Breastfeeding",
    title: "Signs of a good breastfeeding latch",
    excerpt: "What to look for during a feed and where to get support.",
    readTime: "1 min read",
    body: "During a good latch, your baby takes a large mouthful of breast, their lips turn outward, and you can see or hear swallowing. A latch should feel comfortable rather than painful. If feeding hurts or you are worried that your baby is not getting enough milk, ask a lactation professional or your baby's clinician to help.",
    sources: [
      {
        title: "U.S. Office on Women's Health: Getting a good latch",
        url: "https://womenshealth.gov/breastfeeding/learning-breastfeed/getting-good-latch",
      },
    ],
  },
  {
    id: "sterilizing-bottles-simplified",
    category: "Feeding",
    tag: "Bottle care",
    title: "Cleaning bottles and pump parts",
    excerpt: "CDC guidance for cleaning and sanitizing infant feeding equipment.",
    readTime: "1 min read",
    body: "Clean bottles and the parts that contact breast milk after use, and let clean parts air-dry completely before storing. Follow the manufacturer's instructions and the CDC's separate cleaning guides for feeding items and pumps. Daily sanitizing is especially important for babies younger than two months, those born prematurely, or those with weakened immune systems.",
    sources: [
      {
        title: "CDC: Clean, sanitize and store infant feeding items",
        url: "https://www.cdc.gov/hygiene/about/clean-sanitize-store-infant-feeding-items.html",
      },
      {
        title: "CDC: Breast pump hygiene",
        url: "https://www.cdc.gov/hygiene/about/about-breast-pump-hygiene.html",
      },
    ],
  },
  {
    id: "starting-solids-ready-signs",
    category: "Feeding",
    tag: "First foods",
    title: "Signs your baby is ready for solids",
    excerpt: "Readiness signs and ways to prepare food safely.",
    readTime: "1 min read",
    body: "The CDC recommends introducing foods other than breast milk or infant formula at about six months, not before four months. Look for readiness signs such as steady head control, sitting with or without support, and swallowing food rather than pushing it out. Choose textures suited to your baby's development, keep them seated and supervise meals. Breast milk or infant formula continues alongside complementary foods.",
    sources: [
      {
        title: "CDC: When, what and how to introduce solid foods",
        url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html",
      },
      {
        title: "CDC: Choking hazards",
        url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html",
      },
    ],
  },
  {
    id: "safe-sleep-basics",
    category: "Sleep",
    tag: "Safe sleep",
    title: "Safe sleep basics",
    excerpt: "AAP recommendations for a baby's sleep position and sleep space.",
    readTime: "1 min read",
    body: "Place your baby on their back for every sleep, on a firm, flat sleep surface with a fitted sheet. Keep blankets, pillows and other soft objects out of the sleep space. If your baby can roll comfortably both ways, continue putting them down on their back but you do not need to turn them back once they roll on their own. The AAP recommends sharing a room, not a bed, ideally for at least the first six months.",
    sources: [
      {
        title: "American Academy of Pediatrics: A parent's guide to safe sleep",
        url: "https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx",
      },
    ],
  },
  {
    id: "bedtime-routine-that-sticks",
    category: "Sleep",
    tag: "Bedtime",
    title: "Building a bedtime routine",
    excerpt: "Keep bedtime predictable without expecting an immediate change in sleep.",
    readTime: "1 min read",
    body: "Try a calm, consistent bedtime routine. For babies four months and older, the AAP suggests putting your baby to bed when drowsy rather than already asleep. Continue to follow safe-sleep recommendations for every nap and at night. Ask your child's clinician if you are worried about sleep or feeding.",
    sources: [
      {
        title: "American Academy of Pediatrics: Getting your baby to sleep",
        url: "https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/Getting-Your-Baby-to-Sleep.aspx",
      },
      {
        title: "American Academy of Pediatrics: A parent's guide to safe sleep",
        url: "https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx",
      },
    ],
  },
  {
    id: "four-month-sleep-regression",
    category: "Sleep",
    tag: "Sleep development",
    title: "How sleep changes around four months",
    excerpt: "A baby's regular sleep cycles develop over time.",
    readTime: "1 min read",
    body: "The AAP notes that babies do not have regular sleep cycles until about four months of age. Sleep patterns and nighttime waking vary. Keep using a firm, flat sleep surface and place your baby on their back at the start of each sleep. If you are concerned about your baby's sleep, ask your child's clinician.",
    sources: [
      {
        title: "American Academy of Pediatrics: Getting your baby to sleep",
        url: "https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/Getting-Your-Baby-to-Sleep.aspx",
      },
      {
        title: "American Academy of Pediatrics: A parent's guide to safe sleep",
        url: "https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx",
      },
    ],
  },
  {
    id: "baby-choking-what-to-do",
    category: "First aid",
    tag: "Emergency",
    title: "Infant choking: know where to get help",
    excerpt: "Find current first-aid guidance and learn what to do before an emergency.",
    readTime: "1 min read",
    body: "If a baby cannot breathe, cry or cough effectively, call local emergency services immediately and follow the dispatcher's instructions. For current infant choking steps and training, use the American Red Cross guide below. Reading this article does not replace hands-on first-aid or CPR training.",
    sources: [
      {
        title: "American Red Cross: Infant choking first aid",
        url: "https://www.redcross.org/take-a-class/resources/learn-first-aid/infant-choking",
      },
    ],
  },
  {
    id: "fever-when-to-worry",
    category: "First aid",
    tag: "Illness",
    title: "Fever in a young baby",
    excerpt: "When the AAP recommends calling your baby's clinician.",
    readTime: "1 min read",
    body: "For a baby three months old or younger, the AAP advises calling the baby's doctor immediately for a rectal temperature of **100.4°F (38°C) or higher**, even if there are no other symptoms. If a child is having trouble breathing or cannot be woken, call local emergency services. Ask your child's clinician for advice based on their age and symptoms.",
    sources: [
      {
        title: "American Academy of Pediatrics: Fever and your baby",
        url: "https://www.healthychildren.org/english/health-issues/conditions/fever/pages/fever-and-your-baby.aspx",
      },
      {
        title: "NHS: When to get urgent medical help for babies and children under 5",
        url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/",
      },
    ],
  },
  {
    id: "when-to-call-the-pediatrician",
    category: "First aid",
    tag: "Getting help",
    title: "When to get medical help for your baby",
    excerpt: "Recognize emergencies and know how to reach your child's care team.",
    readTime: "1 min read",
    body: "If your baby stops breathing, cannot be woken or is struggling to breathe, call local emergency services. If there is no immediate emergency but your baby is feeding less, has fewer wet nappies than usual, or you are worried about a change in their behaviour, seek medical advice. Keep your child's clinician's daytime and after-hours contact information handy.",
    sources: [
      {
        title: "NHS: When to get urgent medical help for babies and children under 5",
        url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/",
      },
      {
        title: "American Academy of Pediatrics: A parent's guide to urgent care",
        url: "https://www.healthychildren.org/English/family-life/health-management/Pages/urgent-care-ER-or-pediatrician-a-parent-guide.aspx",
      },
    ],
  },
];

export function getArticleById(id: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((a) => a.id === id);
}
