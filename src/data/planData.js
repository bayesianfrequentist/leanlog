// ─── Macro Targets ────────────────────────────────────────────────────────────
export const MACRO_TARGETS = {
  calories: 2350,
  protein: 110,   // physician ceiling
  carbs: 315,
  fat: 72,        // midpoint of 66–78 range
};

// ─── Per-Meal Macro Targets ────────────────────────────────────────────────────
export const MEAL_TARGETS = {
  breakfast: { calories: 609, protein: 30.5, carbs: 85.7, fat: 20.6 },
  lunch:     { calories: 642, protein: 31,   carbs: 97.8, fat: 14.2 },
  snack:     { calories: 345, protein: 22.8, carbs: 46.7, fat: 8.6  },
  dinner:    { calories: 697, protein: 35.9, carbs: 87.9, fat: 22.8 },
};

// ─── Static Meal Details ──────────────────────────────────────────────────────
export const STATIC_MEALS = {
  breakfast: {
    label: 'Breakfast',
    ingredients: [
      '1 cup rolled oats (dry)',
      '1 medium banana',
      '½ cup blueberries',
      '1 tbsp almond butter',
      '1 tbsp honey',
      '½ cup Fage 0% Greek yogurt',
    ],
    macros: MEAL_TARGETS.breakfast,
    notes: 'Cook oats, top with fruit, almond butter, and honey. Mix in yogurt or eat alongside.',
  },
  lunch: {
    label: 'Lunch',
    ingredients: [
      '4 oz chicken thigh (cooked weight)',
      '1 cup jasmine rice (cooked)',
      '1 cup broccoli florets (steamed)',
      '½ cup snap peas',
      '¼ cup shredded carrots',
      'Sauce of the day (see rotation)',
    ],
    macros: MEAL_TARGETS.lunch,
    notes: 'Meal-prep chicken Sunday. Sauce rotates by day — see Macro Summary tab.',
  },
  snack: {
    label: 'Snack',
    ingredients: [
      '2 plain rice cakes',
      '1½ tbsp almond butter',
      '½ cup Fage 0% Greek yogurt',
      '½ cup blueberries',
      '10 raw almonds',
    ],
    macros: MEAL_TARGETS.snack,
    notes: 'Eat mid-afternoon or pre-workout.',
  },
};

// ─── Weekly Schedule ──────────────────────────────────────────────────────────
// dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const WEEKLY_SCHEDULE = [
  { dayOfWeek: 1, label: 'Monday',    session: 'Upper Body Strength',       duration: '48 min' },
  { dayOfWeek: 2, label: 'Tuesday',   session: 'Lower Body + HIIT',         duration: '52 min' },
  { dayOfWeek: 3, label: 'Wednesday', session: 'Rest',                       duration: '—' },
  { dayOfWeek: 4, label: 'Thursday',  session: 'Upper Body Hypertrophy',     duration: '50 min' },
  { dayOfWeek: 5, label: 'Friday',    session: 'Lower Body + Steady-State',  duration: '52 min' },
  { dayOfWeek: 6, label: 'Saturday',  session: 'Active Recovery (optional)', duration: '20–30 min' },
  { dayOfWeek: 0, label: 'Sunday',    session: 'Full Rest',                  duration: '—' },
];

// ─── Workout Exercise Data ────────────────────────────────────────────────────
export const WORKOUTS = {
  'Upper Body Strength': {
    dayLabel: 'Monday',
    exercises: [
      { name: 'Barbell Bench Press',      sets: 4, reps: 5,  restSeconds: 90 },
      { name: 'Barbell Row',              sets: 4, reps: 5,  restSeconds: 90 },
      { name: 'Dumbbell Overhead Press',  sets: 3, reps: 8,  restSeconds: 60 },
      { name: 'Cable Lat Pulldown',       sets: 3, reps: 10, restSeconds: 60 },
      { name: 'Face Pulls (cable)',        sets: 3, reps: 15, restSeconds: 45 },
      { name: "Farmer's Carry or Plank",  sets: 2, reps: 40, restSeconds: 45 },
    ],
  },
  'Lower Body + HIIT': {
    dayLabel: 'Tuesday',
    exercises: [
      { name: 'Barbell Back Squat',           sets: 4, reps: 6,  restSeconds: 90 },
      { name: 'Romanian Deadlift',             sets: 3, reps: 8,  restSeconds: 75 },
      { name: 'Dumbbell Reverse Lunge',        sets: 3, reps: 10, restSeconds: 60 },
      { name: 'Leg Press or Goblet Squat',     sets: 3, reps: 12, restSeconds: 45 },
      { name: 'HIIT Finisher (rower/bike)',     sets: 1, reps: 0,  restSeconds: 0, note: '10 minutes' },
    ],
  },
  'Upper Body Hypertrophy': {
    dayLabel: 'Thursday',
    exercises: [
      { name: 'Incline Dumbbell Press',   sets: 4, reps: 10, restSeconds: 60 },
      { name: 'Seated Cable Row',         sets: 4, reps: 10, restSeconds: 60 },
      { name: 'Dumbbell Lateral Raise',   sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Dumbbell Curl',            sets: 3, reps: 12, restSeconds: 45 },
      { name: 'Tricep Rope Pushdown',     sets: 3, reps: 12, restSeconds: 45 },
      { name: 'Kettlebell Swing',         sets: 3, reps: 15, restSeconds: 45 },
    ],
  },
  'Lower Body + Steady-State': {
    dayLabel: 'Friday',
    exercises: [
      { name: 'Trap Bar / Conventional Deadlift', sets: 4, reps: 5,  restSeconds: 90 },
      { name: 'Bulgarian Split Squat',             sets: 3, reps: 8,  restSeconds: 75 },
      { name: 'Leg Curl',                          sets: 3, reps: 10, restSeconds: 60 },
      { name: 'Calf Raise',                        sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Rowing Machine (15 min)',            sets: 1, reps: 0,  restSeconds: 0, note: '15 minutes' },
    ],
  },
};

// Map day-of-week (0=Sun…6=Sat) to workout session name
export const DAY_TO_WORKOUT = {
  1: 'Upper Body Strength',
  2: 'Lower Body + HIIT',
  4: 'Upper Body Hypertrophy',
  5: 'Lower Body + Steady-State',
};

// ─── Dinner Recipes ───────────────────────────────────────────────────────────
export const DINNER_RECIPES = {
  weekA: [
    {
      id: 'A1',
      name: 'Chicken Tikka Masala',
      url: 'https://www.budgetbytes.com/slow-cooker-chicken-tikka-masala/',
      calories: 716, protein: 40, carbs: 104, fat: 15,
    },
    {
      id: 'A2',
      name: 'Tofu Poke Bowl',
      url: 'https://simple-veganista.com/tofu-poke-bowl-recipe/',
      calories: 695, protein: 31.5, carbs: 93, fat: 24,
    },
    {
      id: 'A3',
      name: 'Vietnamese Noodle Bowl',
      url: 'https://thewoksoflife.com/vietnamese-rice-noodle-salad-chicken/',
      calories: 696, protein: 33.5, carbs: 77, fat: 29,
    },
  ],
  weekB: [
    {
      id: 'B1',
      name: 'Thai Green Curry Tofu',
      url: 'https://www.vnutritionandwellness.com/green-curry-tofu/',
      calories: 700, protein: 26, carbs: 92, fat: 26,
    },
    {
      id: 'B2',
      name: 'Chicken Tinga Tacos',
      url: 'https://www.isabeleats.com/chicken-tinga/',
      calories: 696, protein: 42, carbs: 81.5, fat: 22,
    },
    {
      id: 'B3',
      name: 'Asian Glazed Salmon',
      url: 'https://www.recipetineats.com/asian-glazed-salmon/',
      calories: 679, protein: 42.5, carbs: 79.7, fat: 20.7,
    },
  ],
};

// ─── Dinner Calendar ──────────────────────────────────────────────────────────
// Returns dinner recipe index (0-based) for a given day-of-week, or null for Sunday (flex)
// Mon/Tue→recipe[0], Wed/Thu→recipe[1], Fri/Sat→recipe[2], Sun→null
export function getDinnerForDay(dayOfWeek) {
  if (dayOfWeek === 1 || dayOfWeek === 2) return 0; // Mon/Tue → Dinner 1
  if (dayOfWeek === 3 || dayOfWeek === 4) return 1; // Wed/Thu → Dinner 2
  if (dayOfWeek === 5 || dayOfWeek === 6) return 2; // Fri/Sat → Dinner 3
  return null; // Sunday — flex / eat out
}

// ─── Lunch Sauce Rotation ─────────────────────────────────────────────────────
export const LUNCH_SAUCES = {
  1: { name: 'Teriyaki',       ingredients: 'Soy sauce + honey + ginger + garlic' },
  2: { name: 'Teriyaki',       ingredients: 'Soy sauce + honey + ginger + garlic' },
  3: { name: 'Ginger-Scallion', ingredients: 'Sesame oil + soy + fresh ginger + scallion' },
  4: { name: 'Ginger-Scallion', ingredients: 'Sesame oil + soy + fresh ginger + scallion' },
  5: { name: 'Sriracha-Lime',  ingredients: 'Sriracha + lime juice + honey + fish sauce' },
  6: { name: 'Sriracha-Lime',  ingredients: 'Sriracha + lime juice + honey + fish sauce' },
  0: { name: 'Any / Rest',     ingredients: '—' },
};

// ─── Grocery List ─────────────────────────────────────────────────────────────
export const GROCERY_LIST = {
  both: {
    'Produce': [
      'Bananas (7)',
      'Blueberries (~3.5 cups)',
      'Broccoli florets (7 cups)',
      'Snap peas (3.5 cups)',
      'Shredded carrots (1 bag)',
      'Green onions (1 bunch)',
      'Fresh ginger (1 knob)',
      'Garlic (1 head)',
      'Limes (3)',
    ],
    'Protein': [
      'Chicken thighs boneless skinless (~2.5 lbs)',
      'Fage Total 0% Greek yogurt (2 × 32oz tubs)',
    ],
    'Grains & Pantry': [
      'Rolled oats (large container)',
      'Jasmine rice (5 lb bag)',
      'Rice cakes plain/Quaker (1 bag)',
      'Almond butter (1 jar)',
      'Raw almonds (1 bag)',
      'Honey (1 bottle)',
      'Sesame oil (1 bottle)',
      'Soy sauce low-sodium (1 bottle)',
      'Fish sauce (1 bottle)',
      'Sriracha (1 bottle)',
      'Sesame seeds (1 bag)',
    ],
    'Spices': [
      'Garam masala',
      'Cumin',
      'Turmeric',
      'Smoked paprika',
      'Cayenne',
      'Onion powder',
      'Garlic powder',
      'Chili powder',
      'Black pepper',
      'Salt',
    ],
  },
  weekA: {
    'Produce': [
      'Avocado (1)',
      'Fresh cilantro (1 bunch)',
      'Fresh mint (1 bunch)',
      'Cucumber (1)',
      'Romaine lettuce (1 head)',
      'Bean sprouts (1 bag)',
      'Jalapeño (1)',
    ],
    'Protein': [
      'Extra-firm tofu (2 × 14oz blocks for poke bowl)',
      'Silken/firm tofu (2 × 14oz for curry)',
    ],
    'Grains & Pantry': [
      'Basmati rice (2 lb bag)',
      'Rice vermicelli noodles (1 package)',
    ],
    'Canned & Packaged': [
      'Canned tomatoes/tomato sauce (1 can)',
      'Poke bowl sauce/tamari (1 bottle)',
      'Edamame frozen shelled (1 bag)',
      'Nori sheets',
      'Pickled ginger',
    ],
  },
  weekB: {
    'Produce': [
      'Avocado (1)',
      'Bok choy (4 cups)',
      'Fresh cilantro (1 bunch)',
      'Jalapeño (1)',
    ],
    'Protein': [
      'Chicken breast (~1.5 lbs)',
      'Salmon fillets (4 × 6oz)',
      'Extra-firm tofu (2 × 14oz blocks)',
    ],
    'Dairy': [
      'Sour cream (small container)',
      'Cotija cheese (small block)',
    ],
    'Grains & Pantry': [
      'Small corn tortillas 4" (1 package, at least 16)',
    ],
    'Canned & Packaged': [
      'Canned black beans (2 × 15oz)',
      'Coconut milk full-fat (2 × 14oz)',
      'Green curry paste (1 jar)',
      'Chipotle peppers in adobo (1 can)',
      'Mirin (1 bottle)',
    ],
  },
};

// All category keys in preferred display order
export const GROCERY_CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains & Pantry', 'Canned & Packaged', 'Spices'];
