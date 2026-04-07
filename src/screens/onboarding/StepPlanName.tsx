import type { Currency } from '../../api/types'
import { Button } from '../../components/Button'
import { useTranslation } from 'react-i18next'

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',   locale: 'en-US' },
  { code: 'EUR', symbol: '€',   locale: 'de-DE' },
  { code: 'GBP', symbol: '£',   locale: 'en-GB' },
  { code: 'UAH', symbol: '₴',   locale: 'uk-UA' },
  { code: 'PLN', symbol: 'zł',  locale: 'pl-PL' },
  { code: 'CHF', symbol: 'Fr',  locale: 'de-CH' },
  { code: 'CAD', symbol: 'C$',  locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$',  locale: 'en-AU' },
  { code: 'JPY', symbol: '¥',   locale: 'ja-JP' },
  { code: 'CZK', symbol: 'Kč',  locale: 'cs-CZ' },
  { code: 'SEK', symbol: 'kr',  locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr',  locale: 'nb-NO' },
  { code: 'HUF', symbol: 'Ft',  locale: 'hu-HU' },
  { code: 'RON', symbol: 'lei', locale: 'ro-RO' },
]

type Props = {
  planName: string
  setPlanName: (v: string) => void
  currency: Currency
  setCurrency: (v: Currency) => void
  onNext: () => void
}

export function StepPlanName({ planName, setPlanName, currency, setCurrency, onNext }: Props) {
  const { t } = useTranslation()
  const canProceed = planName.trim().length >= 2

  return (
    <div>
      <div className="text-4xl mb-3">🏡</div>
      <h2 className="text-xl font-bold text-brand-navy mb-1">{t('onboarding.stepPlanName.title')}</h2>
      <p className="text-brand-muted text-sm mb-6">{t('onboarding.stepPlanName.subtitle')}</p>

      <div className="space-y-4">
        <div>
          <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">{t('plans.planName')}</label>
          <input
            type="text"
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            placeholder={t('onboarding.stepPlanName.placeholder')}
            maxLength={40}
            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue placeholder:text-brand-muted/60 transition-all"
            autoFocus
          />
        </div>

        <div>
          <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">{t('plans.currency')}</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  c.code === currency.code
                    ? 'border-brand-blue bg-sky-50 text-brand-blue shadow-sm'
                    : 'border-brand-border bg-white text-brand-muted hover:border-brand-blue/40'
                }`}
              >
                <span className="text-base">{c.symbol}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="mt-8 w-full"
      >
        {t('onboarding.continue')}
      </Button>
    </div>
  )
}
