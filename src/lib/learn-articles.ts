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

export type LearnArticle = {
  id: string;
  category: LearnCategory;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  body: string;
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    id: "sleeping-positions-back-pain",
    category: "Pregnancy",
    tag: "Trimester 2",
    title: "Sleeping positions that ease back pain",
    excerpt:
      "Why side-sleeping is recommended from the second trimester on, and simple pillow setups that make it comfortable.",
    readTime: "4 min read",
    body: `As your bump grows, lying flat on your back gets uncomfortable — and from the second trimester on, most care providers recommend avoiding it for long stretches anyway, since the weight of the uterus can press on major blood vessels.

## The go-to position

Sleeping on your **left side**, with knees slightly bent, is the one most commonly recommended. It improves blood flow to the placenta and your kidneys, and helps reduce swelling in your hands, feet, and ankles.

Side sleeping on the right side is also fine — the important thing is side over back, not left over right specifically.

## Making it comfortable

- **A pillow between your knees** keeps your hips aligned and takes pressure off your lower back.
- **A small pillow or rolled towel under your bump** can relieve the tugging feeling some people get on their side.
- **A wedge behind your back** helps you stay on your side through the night without rolling flat.

## If you wake up on your back

It happens, especially early on — don't panic. Just roll back onto your side. It's the sustained position over long periods that matters most, not a few minutes here and there.

## When to check with your provider

If back pain is sharp, one-sided, or comes with other symptoms like fever, bleeding, or reduced fetal movement, call your provider rather than waiting it out — general aches from a growing bump are normal, but those specific signs aren't.`,
  },
  {
    id: "iron-rich-meals-15-minutes",
    category: "Pregnancy",
    tag: "Nutrition",
    title: "Iron-rich meals your partner can prep in 15 minutes",
    excerpt:
      "Three quick, iron-rich meals a partner can make, plus the vitamin C pairing trick that helps your body absorb it.",
    readTime: "6 min read",
    body: `Iron needs roughly double during pregnancy, and low iron is one of the most common deficiencies — fatigue often gets written off as "just pregnancy tiredness" when it's partly diet. The good news: a partner who wants to help with something concrete can genuinely move the needle here, without either of you needing to cook elaborate meals.

## Easy iron sources worth keeping stocked

- **Lentils and canned beans** — rinse and toss into almost anything; a cup of lentils has more iron than a burger.
- **Spinach or other leafy greens** — frozen works just as well as fresh, and cooks down fast.
- **Fortified cereal** — check the label; many breakfast cereals cover a big chunk of daily iron in one bowl.
- **Eggs** — a moderate source, and endlessly quick to prepare.
- **Lean red meat or dark poultry meat**, if you eat meat — among the most easily absorbed forms of iron.

## Three 15-minute meals

**1. Lentil and spinach skillet** — sauté a chopped onion and garlic, add a can of lentils and a handful of spinach, season, done.

**2. Loaded fortified cereal bowl** — fortified cereal, milk, sliced strawberries (vitamin C helps iron absorption).

**3. Egg and bean scramble wrap** — scrambled eggs with black beans and salsa in a warm tortilla.

## The pairing trick

Vitamin C helps your body absorb non-meat (plant) iron sources significantly better. A glass of orange juice, some bell pepper, or a squeeze of lemon alongside an iron-rich meal makes a real difference — and coffee or tea right after a meal can do the opposite, so it's worth spacing those out if iron is a concern.

## When to loop in your provider

If you're feeling persistently exhausted, dizzy, or short of breath, mention it — bloodwork can confirm whether it's iron specifically, and whether a supplement makes sense alongside diet changes.`,
  },
  {
    id: "grounding-practice-restless-evenings",
    category: "Pregnancy",
    tag: "Mind",
    title: "A gentle grounding practice for restless evenings",
    excerpt:
      "A simple 5-4-3-2-1 sensory exercise for evenings when your mind won't slow down enough to rest.",
    readTime: "3 min read",
    body: `Some evenings, the mind won't slow down — a mix of excitement, worry, physical discomfort, and just being plain tired of being tired. A short grounding practice won't fix everything, but it can take the edge off enough to actually rest.

## The 5-4-3-2-1 method

This is a simple sensory-grounding exercise that works well lying down in bed:

1. Notice **5 things you can feel** — the sheets, the pillow, your own breathing.
2. Notice **4 things you can hear** — even faint sounds count.
3. Notice **3 things you can smell** — or recall a comforting smell if none are present.
4. Notice **2 slow, deliberate breaths** — in through the nose, longer exhale through the mouth.
5. Notice **1 thing you're looking forward to** — however small.

## Why it helps

Restless evenings are often the nervous system stuck in a slightly activated state — not full anxiety, just enough to keep sleep out of reach. Deliberately shifting attention to physical senses, rather than the running mental to-do list, tends to bring that activation down a notch.

## A few other things worth trying

- **A warm (not hot) shower** an hour before bed.
- **Writing down tomorrow's worries** on paper, so the brain doesn't have to hold onto them overnight.
- **Dimming lights** earlier than feels necessary — light exposure in the evening delays the body's natural wind-down.

## If restlessness turns into something more

Occasional restless nights are normal, especially in the third trimester. But persistent anxiety, racing thoughts, or a low mood that doesn't lift is worth mentioning to your care provider — pregnancy-related anxiety is common and very treatable, and there's no need to just push through it alone.`,
  },
  {
    id: "getting-a-good-latch",
    category: "Feeding",
    tag: "Breastfeeding",
    title: "Getting a good latch: positions worth trying",
    excerpt:
      "How to spot a good latch, four nursing positions to try, and when it's worth calling a lactation consultant.",
    readTime: "5 min read",
    body: `A good latch is the single biggest factor in comfortable, effective feeding — and it often takes a few tries and a bit of adjusting to find what works for your body and your baby.

## Signs of a good latch

- Baby's mouth is opened **wide**, taking in a large mouthful of breast tissue, not just the nipple.
- Lips are **flanged outward**, not tucked in.
- You feel **tugging, not pinching or sharp pain** — some initial tenderness in the first days is common, but ongoing pain usually means something about the latch needs adjusting.
- You can hear **swallowing**, not just sucking.

## Positions to try

**Cradle hold** — baby's head in the crook of your elbow, tummy facing yours. The classic starting point for many.

**Cross-cradle hold** — you support baby's head with the hand opposite the breast you're feeding from, giving you more control while you're both still learning.

**Football (clutch) hold** — baby tucked under your arm like a football, feet pointing behind you. Often more comfortable after a C-section, and gives good visibility of the latch.

**Side-lying** — you and baby both lying on your sides, facing each other. Useful for nighttime feeds or while you're recovering.

## A simple way to bring baby to the latch

Bring baby to the breast chin-first, nose level with the nipple, and wait for a wide-open mouth before pulling them in close — rather than leaning yourself forward into baby.

## When to ask for help

If latching consistently hurts, baby seems endlessly frustrated at the breast, or weight gain is a concern, a lactation consultant can watch a feed and spot things that are genuinely hard to self-diagnose. This is common and not a sign you're doing something wrong — it's a hands-on skill for both of you to learn together.`,
  },
  {
    id: "sterilizing-bottles-simplified",
    category: "Feeding",
    tag: "Bottle care",
    title: "Sterilizing bottles and pump parts, simplified",
    excerpt:
      "The simple daily wash routine for bottles and pump parts, and when full sterilizing is actually needed.",
    readTime: "4 min read",
    body: `Bottle and pump-part hygiene matters most in the early months, when a baby's immune system is still developing — but it doesn't need to be complicated.

## Before first use

Sterilize new bottles, nipples, and pump parts once before their first use — boiling for 5 minutes, a steam sterilizer, or a microwave sterilizing bag all work.

## Day to day

After the first use, most guidance shifts to a simpler routine:

1. **Rinse** parts in cold water right after use to keep milk from drying on.
2. **Wash** in hot, soapy water with a dedicated bottle brush, or run through the dishwasher on a hot cycle if parts are dishwasher-safe.
3. **Air-dry** completely on a clean rack before reassembling — trapped moisture is where bacteria grows.

## When to sterilize again (not just wash)

- Baby is under **3 months old**, was born prematurely, or has a weakened immune system.
- After an **illness** in the household.
- Roughly **once a day** is a reasonable middle ground many caregivers settle into for young infants, even without a specific reason.

## A few practical tips

- Keep a **separate small brush** just for nipples and pump valves — their narrow parts trap residue that a regular sponge misses.
- **Fully disassemble** pump parts and bottles before washing; anything left assembled can hide milk residue in the joints.
- Store dry parts in a **clean, covered container** rather than loose in a drying rack overnight.

## When to check with your pediatrician

If you're ever unsure whether a piece of equipment is still safe to use — cracked bottles, cloudy plastic, worn-out valves — it's simpler and safer to replace than to keep sterilizing.`,
  },
  {
    id: "starting-solids-ready-signs",
    category: "Feeding",
    tag: "Solids",
    title: 'Starting solids: what "ready" actually looks like',
    excerpt:
      "The developmental signs that actually matter more than the calendar, plus safe first foods and what to avoid.",
    readTime: "5 min read",
    body: `Most guidance points to around **6 months** as the general starting point for solids, but the calendar is only part of the picture — readiness is really about a set of developmental signs happening together.

## Signs your baby may be ready

- Can **sit up with minimal support** and hold their head steady.
- Has lost the **tongue-thrust reflex** — no longer automatically pushing food back out with their tongue.
- Shows **real interest in food** — watching you eat, reaching for your plate, opening their mouth as food approaches.
- Can **move food to the back of the mouth** and swallow, rather than just gumming it around.

## Starting simple

There's no strict requirement to start with a particular food group. Common first foods include:

- **Iron-fortified infant cereal** mixed to a thin consistency.
- **Mashed or pureed single vegetables** — sweet potato, avocado, and squash are easy places to start.
- **Soft, easily gummed fruits** — ripe banana or well-cooked pear.

Whether you go the traditional purée route, baby-led weaning, or a mix of both is largely a matter of preference — talk it through with your pediatrician if you're unsure which fits your baby.

## What to hold off on

- **Honey** — a botulism risk before age 1.
- **Cow's milk as a main drink** — small amounts in cooking are fine, but it shouldn't replace breast milk or formula yet.
- **Choking hazards** — whole grapes, nuts, popcorn, hard raw vegetables — until age and chewing ability catch up, and even then, cut and prepare carefully.

## Pace, not perfection

Solids at this stage are mostly about **practice, not nutrition** — breast milk or formula is still the main source of calories for a while yet. Offering one new food at a time, a few days apart, makes it easier to notice any reaction.

## When to check with your pediatrician

Before starting solids if your baby was premature, has a diagnosed allergy risk, or any feeding or swallowing concern — and any time a reaction (rash, vomiting, unusual fussiness after a new food) shows up.`,
  },
  {
    id: "safe-sleep-basics",
    category: "Sleep",
    tag: "Safe sleep",
    title: "Safe sleep basics, in plain language",
    excerpt:
      "The core safe-sleep rules — back, alone, crib — and why a bare crib is safer than a cozy-looking one.",
    readTime: "4 min read",
    body: `Safe sleep guidance can feel like a long list of rules — here's the short version of what actually matters most, based on widely recommended pediatric guidance.

## The core rule: back, alone, crib

- **Back to sleep** — every sleep, every time, until baby can reliably roll both ways on their own.
- **Alone in their own sleep space** — a crib or bassinet, not a parent's bed, couch, or armchair.
- **A firm, flat surface** — no soft mattresses, no inclined sleepers.

## Keep the sleep space bare

- **No loose blankets, pillows, bumpers, or stuffed animals** in the crib for the first year — they're a suffocation risk, even though a cozy-looking crib is tempting to set up.
- A **fitted sheet only** on the mattress.
- If it's cold, a **wearable blanket (sleep sack)** is the safer alternative to loose bedding.

## Room-sharing, not bed-sharing

Most guidance recommends baby sleep in the **same room as a parent**, in their own sleep space, for at least the first 6 months — this is associated with lower risk, without the added risks of sharing an adult bed.

## Other things that help

- **Avoid overheating** — dress baby for the room temperature, not extra layers "just in case."
- **Offer a pacifier at sleep times** once breastfeeding is well established, if you use one — it's associated with lower risk.
- **Keep smoke exposure away** from baby's environment entirely.

## None of this has to be perfect

Life with a newborn is messy, and there will be nights that don't go by the book. The goal is to make the *default*, everyday setup as safe as possible — not to panic over one exhausted middle-of-the-night lapse.`,
  },
  {
    id: "bedtime-routine-that-sticks",
    category: "Sleep",
    tag: "Routines",
    title: "Building a bedtime routine that actually sticks",
    excerpt:
      "Why consistency matters more than the exact steps, and a simple, repeatable routine to start with.",
    readTime: "5 min read",
    body: `A predictable bedtime routine doesn't guarantee an easy night, but it gives baby's body a consistent signal that sleep is coming — and that consistency tends to pay off over weeks, not days.

## Keep it short and repeatable

A routine that takes 20–30 minutes is usually more sustainable than an elaborate one — the goal is something you can realistically do every single night, including the exhausting ones.

A simple sequence that works for many families:

1. **Bath or a warm wipe-down** (doesn't need to be every night).
2. **Dim the lights** and lower the noise level in the house.
3. **A feed**, offered calmly rather than as the very last thing before sleep once baby's a bit older, to avoid feeding becoming the only way they know how to fall asleep.
4. **A short story, song, or quiet cuddle.**
5. **Into the crib, still a little awake** rather than already asleep, when developmentally ready for that step.

## Consistency matters more than the exact steps

The specific activities matter far less than doing roughly the same things, in roughly the same order, at roughly the same time each night. That predictability is what actually builds the sleep association.

## When to start

Newborns don't have much of a day-night rhythm yet, so a "routine" in the early weeks is more about calm, low-stimulation evenings than a strict sequence. Most families find a real routine starts clicking somewhere between **6–12 weeks**, as day-night rhythms develop.

## If it's not sticking yet

Some resistance is completely normal, especially around developmental leaps, teething, or illness. Give a new routine **1–2 weeks** of consistent effort before deciding whether it's working — sleep changes rarely show results overnight.

## When to check with your pediatrician

If sleep struggles come with feeding difficulties, very limited total sleep, or you're worried about baby's development more broadly, it's worth a conversation — most sleep bumps are normal, but it never hurts to rule out something more.`,
  },
  {
    id: "four-month-sleep-regression",
    category: "Sleep",
    tag: "Milestones",
    title: "The 4-month sleep regression, explained",
    excerpt:
      "Why sleep suddenly falls apart around 3-4 months, and what actually helps baby learn to resettle.",
    readTime: "4 min read",
    body: `If sleep that was starting to feel manageable suddenly falls apart around 3–4 months, you're not imagining it — and it's not something you broke.

## What's actually happening

Around this age, babies' sleep cycles mature and start to resemble adult sleep architecture — moving through lighter and deeper stages, with brief wake-ups between cycles. Younger babies mostly bypass this; older babies (and adults) wake briefly too, but usually resettle without anyone noticing.

A 4-month-old hasn't yet learned how to resettle on their own, so those normal, brief wake-ups turn into fully-awake, calling-for-help moments — often several times a night.

## It's a permanent shift, not a phase to just wait out

Unlike some other rough patches, this one reflects a genuine, permanent change in how sleep works — which is actually good news: it means there's a skill to build (self-resettling), not just time to run out the clock on.

## What tends to help

- **A consistent, calm bedtime routine** (see the routine guide above) — predictability supports the new sleep architecture.
- **An age-appropriate wake window** — an overtired baby often sleeps worse, not better.
- **Putting baby down drowsy but still awake**, when you're comfortable with that step, to give them practice falling asleep independently.
- **Patience with the process** — building a new sleep skill takes consistent practice, typically over a couple of weeks, not one night.

## What's normal vs. worth flagging

Multiple wake-ups a night and shorter naps are the norm during this stretch. If sleep doesn't start improving after several weeks of a consistent approach, or you're concerned about something beyond typical sleep disruption, your pediatrician is a good next stop — they can help rule out other causes and talk through sleep-training approaches that fit your family.`,
  },
  {
    id: "baby-choking-what-to-do",
    category: "First aid",
    tag: "Emergency",
    title: "What to do if your baby is choking",
    excerpt:
      "How to tell choking apart from normal gagging, and the back-blow/chest-thrust steps for babies under 1.",
    readTime: "5 min read",
    body: `This is general information, not a substitute for hands-on training — a certified infant CPR and choking course (often just a few hours, sometimes offered free through hospitals or community centers) is genuinely worth taking before you need it.

## First, tell the difference: choking vs. gagging

**Gagging is normal and often noisy** — baby coughs, makes sounds, and their face may turn red. This is baby's airway working, clearing something on its own. Let it happen; don't intervene unless it turns into true choking.

**True choking looks different** — baby can't cough, cry, or make sound at all, and may turn blue or grey. This needs immediate action.

## If a baby under 1 year is truly choking

1. Call for someone to **dial emergency services** — or do it yourself on speaker if you're alone.
2. Sit and lay baby **face-down along your forearm**, supporting the jaw, head lower than the chest.
3. Give **5 firm back blows** between the shoulder blades with the heel of your hand.
4. If the object doesn't come out, flip baby **face-up along your other arm**, head still lower than chest, and give **5 chest thrusts** with two fingers on the center of the breastbone.
5. **Repeat** the back-blow/chest-thrust cycle until the object comes out or baby starts coughing, crying, or breathing.
6. If baby becomes **unresponsive**, begin infant CPR if trained, and continue until emergency help arrives.

## Reducing the risk in the first place

- Cut round, firm foods (grapes, hot dogs, cherry tomatoes) into small, non-round pieces.
- Avoid whole nuts, popcorn, and hard raw vegetables until well past the toddler years.
- Always **supervise** mealtimes — a baby left alone with food, even briefly, is a real risk factor.

## The single most important takeaway

A real choking emergency needs emergency services and, ideally, hands you've already trained for exactly this — reading this article is a starting point, not a replacement for that training.`,
  },
  {
    id: "fever-when-to-worry",
    category: "First aid",
    tag: "Illness",
    title: "Fever in babies: when to worry, when to wait",
    excerpt:
      "Why age matters more than the number on the thermometer, and the signs that mean don't wait to seek care.",
    readTime: "4 min read",
    body: `A fever itself isn't dangerous — it's usually a sign the immune system is doing its job. What matters most is baby's age and how they're acting alongside the number on the thermometer.

## What counts as a fever

Generally, a **rectal temperature of 100.4°F (38°C) or higher** is considered a fever in babies — rectal readings are the most accurate for infants, which is why pediatricians often ask for that specific number.

## Age changes everything

- **Under 3 months old**: any fever of 100.4°F or higher is a same-day call to your pediatrician or urgent care, even if baby seems otherwise okay. A young infant's immune system can't yet reliably fight off infection the way an older baby's can, so providers take any fever seriously at this age.
- **3–6 months old**: call your pediatrician for guidance, especially for fevers above 102°F (38.9°C) or a fever lasting more than a day.
- **Over 6 months old**: how baby is *acting* matters more than the exact number — a fever with a baby who's still drinking, alert, and consolable is generally lower urgency than a lower fever with a baby who's very listless or hard to console.

## Signs that mean don't wait — seek care now, regardless of age

- Difficulty breathing, or breathing that looks labored.
- A rash that doesn't fade when pressed.
- Persistent vomiting, or signs of dehydration (very few wet diapers, no tears when crying, sunken soft spot).
- Extreme fussiness, or the opposite — unusually limp or hard to wake.
- A fever accompanied by a stiff neck, or baby seems to be in significant pain.

## What generally helps at home for a milder fever in an older baby

- **Fluids** — keep offering breast milk, formula, or water depending on age.
- **Light clothing**, not bundled up.
- **Fever-reducing medication** (acetaminophen or, for babies over 6 months, ibuprofen) only at the dose and age your pediatrician has specifically approved — dosing by weight matters, and it's worth confirming rather than guessing.

## The general rule

When in doubt, call. Pediatric offices field fever questions constantly, and a quick call is far better than guessing on something that's genuinely age-sensitive.`,
  },
  {
    id: "when-to-call-the-pediatrician",
    category: "First aid",
    tag: "Guidance",
    title: "Signs that mean it's time to call the pediatrician",
    excerpt:
      "A same-day-call checklist, an ER checklist, and why your own instincts are worth trusting too.",
    readTime: "4 min read",
    body: `New parents often worry about "bothering" their pediatrician's office with small questions — but a quick call is exactly what that office is there for, and it's always better than guessing on something that turns out to matter.

## Call the same day for

- **Fever** in a baby under 3 months old, or a fever over a couple of days in an older baby.
- **Feeding refusal** lasting more than one or two feeds, especially with fewer wet diapers than usual.
- **Persistent vomiting** (not just normal spit-up) or diarrhea lasting more than a day.
- **A rash** that's spreading, blistering, or doesn't fade when you press on it.
- **Unusual sleepiness** — harder than normal to wake, or sleeping through feeds repeatedly.
- **Ongoing, inconsolable crying** well beyond baby's normal fussy stretches.

## Go to the ER or call emergency services for

- **Difficulty breathing** — fast, labored, or grunting breaths, or blue lips/face.
- **A seizure**, even a brief one.
- **A serious fall or injury**, especially to the head.
- **Signs of severe dehydration** — no wet diaper in 8+ hours, sunken eyes or soft spot, no tears when crying.
- **Any true choking episode** where baby couldn't breathe, even after it resolves.

## Trust your instincts too

Beyond any specific checklist, if something just feels wrong — a cry that sounds different, a look on baby's face that's not like them — that instinct is worth listening to. Pediatricians hear this constantly from parents and take it seriously; you spend more time with your baby than anyone else, and that familiarity counts for something real.

## Keep these handy

- Your pediatrician's **after-hours line**, saved somewhere you can find it fast.
- **Poison control's number**, saved the same way.
- A general sense of the **nearest ER with pediatric care**, before you ever need it.

Having these ready ahead of time means one less thing to figure out in a moment that's already stressful.`,
  },
];

export function getArticleById(id: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((a) => a.id === id);
}
