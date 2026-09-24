// Frontend demonstration repository only; no database is connected.
// Categories are display metadata. Search always ranks the complete repository.
const categories = {
  "Programming": [
    "What is the best way to learn Python?",
    "How should a beginner start learning Python?",
    "How can I start learning Python?",
    "How do I install Python on Windows?",
    "How can I learn Java programming?",
    "How do I connect React to an API?"
  ],
  "Education": [
    "How can I study more effectively?",
    "What is the best way to prepare for exams?",
    "How can I improve my concentration while studying?",
    "How can I remember what I study?",
    "How should I manage my study time?",
    "How can I improve my study routine for exams?"
  ],
  "Career": [
    "How can I get a good job?",
    "What skills can help me get a better job?",
    "How can I improve my career?",
    "What skills are important for career growth?",
    "How can I change careers without experience?",
    "How can I find a mentor for my career?"
  ],
  "Money & Finance": [
    "How can I become wealthy?",
    "What are some ways to build wealth?",
    "How can I become financially successful?",
    "What are good ways to make more money?",
    "How can I improve my financial future?",
    "How can I start investing for the future?"
  ],
  "Technology": [
    "What is cloud computing?",
    "What are the advantages of cloud computing?",
    "What is machine learning?",
    "How does artificial intelligence differ from machine learning?",
    "How can I protect my online accounts?",
    "What should I consider before buying a laptop?"
  ],
  "Health & Fitness": [
    "How can I lose weight?",
    "What are healthy ways to lose weight?",
    "How can I become more physically fit?",
    "What exercises are good for beginners?",
    "How can I improve my sleep?",
    "How can I build a regular fitness routine?"
  ],
  "Travel": [
    "How can I travel on a low budget?",
    "What are some ways to save money while travelling?",
    "How should I plan my first international trip?",
    "What should I pack for a long trip?",
    "How can I find cheap flights?",
    "How can I spend less money on travel?"
  ],
  "Food & Cooking": [
    "How can I cook rice without making it sticky?",
    "What are easy meals for beginner cooks?",
    "How can I bake bread at home?",
    "How can I keep vegetables fresh for longer?",
    "What can I use instead of eggs when baking?",
    "How can I prepare healthy meals on a budget?"
  ],
  "Productivity": [
    "How can I manage my time better?",
    "How can I stop procrastinating?",
    "How can I stay focused while working?",
    "How should I prioritize my daily tasks?",
    "How can I reduce distractions from my phone?",
    "How can I plan a productive week?"
  ],
  "General Knowledge": [
    "How do elections work in a democracy?",
    "Why do countries use different currencies?",
    "How did the printing press change education?",
    "What is the difference between a continent and a country?",
    "Why do we use different time zones?",
    "How are world heritage sites selected?"
  ],
  "Communication & English": [
    "How can I improve my spoken English?",
    "How can I speak confidently in public?",
    "What are good ways to expand my vocabulary?",
    "How can I write a clear professional email?",
    "How can I become a better listener?",
    "How can I practice English pronunciation?"
  ],
  "Science": [
    "Why do objects fall toward the ground?",
    "How do plants use sunlight to grow?",
    "What causes the ocean tides?",
    "How does electricity flow through a circuit?",
    "Why does water expand when it freezes?",
    "How does the human heart pump blood?"
  ],
  "College & Students": [
    "How can I choose a suitable college course?",
    "How should I plan my final year project?",
    "How can students balance study and part-time work?",
    "How can I find scholarships for college?",
    "How can I make friends during my first year at college?",
    "What should I include in a college project report?"
  ],
  "Jobs & Interviews": [
    "How should I prepare for a job interview?",
    "How can I write a resume with no work experience?",
    "What questions should I ask during an interview?",
    "How can I prepare for a technical interview?",
    "How should I explain a gap in my employment?",
    "How can I find an internship as a student?"
  ],
  "Everyday Life": [
    "How can I wake up early?",
    "How can I build better habits?",
    "How can I become more confident?",
    "How can I organize a small room?",
    "What should I check before buying a used car?",
    "How can I reduce my household electricity bill?"
  ]
}
export const questions = Object.entries(categories).flatMap(([category, items]) =>
  items.map(question => ({ question, category }))
).map((item, index) => ({ id: index + 1, ...item }))

export const sampleQuestions = [
  'How can I learn Python?', 'What is the best way to learn Python?',
  'How do I install Python?', 'What is cloud computing?', 'Explain cloud computing',
  'What is machine learning?', 'Explain machine learning', 'How can I learn Java?',
]
