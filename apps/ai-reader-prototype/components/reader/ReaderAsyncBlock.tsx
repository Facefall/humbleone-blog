'use client'

import { useRef } from 'react'
import { useGsapElementEntrance } from '../../hooks/useGsapMotion'

type ReaderAsyncBlockProps = {
  detail: string
  label: string
  tone?: 'default' | 'compact'
}

export function ReaderAsyncBlock({ detail, label, tone = 'default' }: ReaderAsyncBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null)

  useGsapElementEntrance(blockRef, `${label}:${detail}`, {
    duration: 0.18,
    scale: 0.99,
    y: -2,
  })

  return (
    <div ref={blockRef} className={`standard-async-block tone-${tone}`} role="status" aria-busy="true">
      <span className="standard-async-glyph" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <strong>{label}</strong>
      <p>{detail}</p>
    </div>
  )
}
