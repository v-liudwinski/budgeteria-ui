export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  plans: ['plans'] as const,
  expenses: (planId: string) => ['expenses', planId] as const,
}
