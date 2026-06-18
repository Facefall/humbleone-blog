import {
  Courier_Prime,
  JetBrains_Mono,
  Newsreader,
  Noto_Serif_SC,
} from 'next/font/google'
import localFont from 'next/font/local'

export const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
})

export const notoSerifSc = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-serif-sc',
})

export const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-courier-prime',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const sarasaMonoSc = localFont({
  src: [
    {
      path: '../public/fonts/SarasaMonoSC-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SarasaMonoSC-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-sarasa-mono-sc',
  fallback: ['Courier New', 'monospace'],
})

export const fontVariables = [
  newsreader.variable,
  notoSerifSc.variable,
  courierPrime.variable,
  jetbrainsMono.variable,
  sarasaMonoSc.variable,
].join(' ')

export const fontSerif =
  'var(--font-newsreader), var(--font-noto-serif-sc), "Source Han Serif SC", Georgia, serif'

export const fontMono =
  'var(--font-courier-prime), var(--font-sarasa-mono-sc), "Courier New", Courier, monospace'

export const fontNote =
  'var(--font-newsreader), var(--font-noto-serif-sc), "Source Han Serif SC", Georgia, serif'

export const fontTerminal =
  'var(--font-jetbrains-mono), var(--font-sarasa-mono-sc), Consolas, "Liberation Mono", monospace'
