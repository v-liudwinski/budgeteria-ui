export type CategoryPreset = {
  id: string
  name: string
  emoji: string
  color: string
  isEssential: boolean
  suggestedPct: number // suggested % of income
}

export const defaultCategories: CategoryPreset[] = [
  // Essential
  { id: 'housing',       name: 'Housing & Rent',      emoji: '🏠', color: 'sky',     isEssential: true,  suggestedPct: 30 },
  { id: 'food',          name: 'Food & Groceries',    emoji: '🛒', color: 'emerald',  isEssential: true,  suggestedPct: 12 },
  { id: 'bills',         name: 'Bills & Utilities',   emoji: '💡', color: 'amber',    isEssential: true,  suggestedPct: 8  },
  { id: 'health',        name: 'Health & Medical',    emoji: '🏥', color: 'green',    isEssential: true,  suggestedPct: 5  },
  { id: 'insurance',     name: 'Insurance',           emoji: '🛡️', color: 'slate',    isEssential: true,  suggestedPct: 5  },
  { id: 'transport',     name: 'Transport',           emoji: '🚗', color: 'blue',     isEssential: true,  suggestedPct: 8  },
  // Lifestyle
  { id: 'clothes',       name: 'Clothes & Shopping',  emoji: '👗', color: 'pink',     isEssential: false, suggestedPct: 5  },
  { id: 'entertainment', name: 'Entertainment',       emoji: '🎭', color: 'orange',   isEssential: false, suggestedPct: 5  },
  { id: 'education',     name: 'Education',           emoji: '📚', color: 'indigo',   isEssential: false, suggestedPct: 3  },
  { id: 'dining',        name: 'Dining Out',          emoji: '🍽️', color: 'rose',     isEssential: false, suggestedPct: 5  },
  { id: 'personal',      name: 'Personal Care',       emoji: '💅', color: 'violet',   isEssential: false, suggestedPct: 3  },
  { id: 'gifts',         name: 'Gifts & Donations',   emoji: '🎁', color: 'red',      isEssential: false, suggestedPct: 2  },
  // Savings
  { id: 'emergency',     name: 'Emergency Fund',      emoji: '🏦', color: 'teal',     isEssential: false, suggestedPct: 5  },
  { id: 'vacation',      name: 'Vacation',            emoji: '✈️', color: 'cyan',     isEssential: false, suggestedPct: 3  },
  { id: 'investments',   name: 'Investments',         emoji: '📈', color: 'lime',     isEssential: false, suggestedPct: 5  },
]
