import type { Category } from '../context/types'

export const mockCategories: Category[] = [
  { id: 'food',          name: 'Food & Groceries',   animal: '🐿️', color: 'emerald', limit: 600,  spent: 320  },
  { id: 'bills',         name: 'Bills & Utilities',  animal: '🦉', color: 'amber',   limit: 500,  spent: 480  },
  { id: 'transport',     name: 'Transport',           animal: '🐦', color: 'sky',     limit: 200,  spent: 128  },
  { id: 'savings',       name: 'Savings',             animal: '🦔', color: 'violet',  limit: 500,  spent: 200  },
  { id: 'insurance',     name: 'Insurance',           animal: '🐢', color: 'slate',   limit: 220,  spent: 180  },
  { id: 'health',        name: 'Health & Medical',    animal: '🐸', color: 'green',   limit: 120,  spent: 22   },
  { id: 'clothes',       name: 'Clothes & Shopping',  animal: '🦋', color: 'pink',    limit: 300,  spent: 80   },
  { id: 'entertainment', name: 'Entertainment',       animal: '🦊', color: 'orange',  limit: 150,  spent: 65   },
  { id: 'education',     name: 'Education',           animal: '🦅', color: 'indigo',  limit: 200,  spent: 0    },
  { id: 'misc',          name: 'Miscellaneous',       animal: '🐾', color: 'zinc',    limit: 100,  spent: 35   },
]
