import type { Currency } from '../context/types'

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
  { code: 'SEK', symbol: 'kr',  locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr',  locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr',  locale: 'da-DK' },
  { code: 'CZK', symbol: 'Kč',  locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft',  locale: 'hu-HU' },
  { code: 'RON', symbol: 'lei', locale: 'ro-RO' },
]

type Props = {
  current: Currency
  onSelect: (currency: Currency) => void
  onClose: () => void
}

export function CurrencyPicker({ current, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        data-testid="backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-t-3xl md:rounded-2xl w-full md:w-96 max-h-[70vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-slate-100 font-semibold">Select Currency</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
        </div>
        <div className="overflow-y-auto no-scrollbar">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { onSelect(c); onClose() }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800 transition-colors text-left ${c.code === current.code ? 'bg-emerald-950/40' : ''}`}
            >
              <span className="text-slate-400 font-mono w-8 text-sm">{c.symbol}</span>
              <span className={`font-semibold text-sm ${c.code === current.code ? 'text-emerald-400' : 'text-slate-100'}`}>{c.code}</span>
              {c.code === current.code && <span className="ml-auto text-emerald-400 text-xs">✓ active</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
