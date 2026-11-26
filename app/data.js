// Data for the HomeLedger planner. The household below is a labelled
// sample: the site says so, and changing any number replaces it. Edits
// are saved in the visitor's own browser only, never sent anywhere.
const CATEGORIES = [
  { id: "housing", label: "Housing", bucket: "needs", color: "#1f6f4a" },
  { id: "food", label: "Food & groceries", bucket: "needs", color: "#2a7f6f" },
  { id: "transport", label: "Transport", bucket: "needs", color: "#4a90a4" },
  { id: "utilities", label: "Utilities", bucket: "needs", color: "#7a9e7e" },
  { id: "health", label: "Health", bucket: "needs", color: "#8a7ca8" },
  { id: "entertainment", label: "Entertainment", bucket: "wants", color: "#e07856" },
  { id: "clothing", label: "Clothing", bucket: "wants", color: "#e8a33d" },
  { id: "other", label: "Other", bucket: "wants", color: "#b8c2cc" },
  { id: "savings", label: "Savings", bucket: "savings", color: "#c96f2e" },
];

const BUCKETS = [
  { id: "needs", label: "Needs", target: 50, about: "The things you cannot live without: housing, food, transport, utilities, health." },
  { id: "wants", label: "Wants", target: 30, about: "The things that make life enjoyable but are not essential: eating out, films, holidays, new clothes." },
  { id: "savings", label: "Savings", target: 20, about: "Paying your future self first: emergency fund, retirement, debt overpayments and goals." },
];

const SAMPLE_HOUSEHOLD = {
  name: "The Rivera household",
  income: 6400,
  incomeNote: "Two salaries, after tax, per month",
  expenses: [
    { id: "e1", category: "housing", label: "Rent", amount: 1900 },
    { id: "e2", category: "food", label: "Weekly groceries", amount: 780 },
    { id: "e3", category: "transport", label: "Fuel & bus passes", amount: 520 },
    { id: "e4", category: "utilities", label: "Electricity, water, internet", amount: 310 },
    { id: "e5", category: "health", label: "Health insurance", amount: 240 },
    { id: "e6", category: "entertainment", label: "Streaming & cinema", amount: 260 },
    { id: "e7", category: "clothing", label: "Clothes", amount: 120 },
    { id: "e8", category: "other", label: "Gifts & misc", amount: 180 },
    { id: "e9", category: "savings", label: "Emergency fund", amount: 800 },
  ],
  goals: [
    { id: "g1", name: "Emergency fund", target: 10000, saved: 6200, note: "Three months of essential spending, kept in a separate account." },
    { id: "g2", name: "Summer holiday", target: 2400, saved: 900, note: "Two weeks by the coast, flights and a rental included." },
    { id: "g3", name: "Replacement car", target: 8000, saved: 1500, note: "The current car is twelve years old; saving ahead of the next repair bill." },
  ],
};

const TIPS = [
  { title: "Start with the 50/30/20 rule", body: "Aim for about 50% of take-home pay on needs, 30% on wants and 20% on savings and extra debt payments. It is a starting point, not a law — a household in an expensive city may need 60% on needs and should shrink wants first, never savings to zero." },
  { title: "Pay yourself first", body: "Move money to savings on payday, before spending starts. An automatic transfer on the 1st of the month beats willpower on the 28th. Even $100 a month builds a habit, and the habit matters more than the amount." },
  { title: "Build the emergency fund before investing", body: "Three to six months of essential spending in a separate, easy-to-reach account is the foundation. It turns a broken washing machine into an annoyance instead of a debt." },
  { title: "Track every dollar for one month", body: "Most households find $100–$300 a month they did not know they were spending — subscriptions, takeaways, small daily purchases. One honest month of tracking usually finds the money for the savings goal." },
  { title: "Review weekly, not yearly", body: "A ten-minute check every Sunday — what came in, what went out, what is left — keeps a budget alive. A budget reviewed once a year is a wish list." },
  { title: "Give every dollar a job", body: "Money with no plan gets spent. When income arrives, assign it: this much to rent, this much to food, this much to the holiday goal. Unassigned money is the money that disappears." },
];
