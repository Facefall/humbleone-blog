'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { type RefObject, useLayoutEffect, useRef } from 'react'

gsap.registerPlugin(useGSAP)

type RevealOptions = {
  selector: string
  delay?: number
  duration?: number
  scale?: number
  stagger?: number
  x?: number
  y?: number
}

function reducedMotionIsActive() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getMotionTargets(selector: string, scope: HTMLElement) {
  return gsap.utils.toArray<HTMLElement>(selector, scope)
}

export function useGsapStaggerReveal<TElement extends HTMLElement>(
  containerRef: RefObject<TElement | null>,
  motionKey: string | number | boolean | null,
  {
    selector,
    delay = 0,
    duration = 0.26,
    scale = 1,
    stagger = 0.024,
    x = 0,
    y = 8,
  }: RevealOptions,
) {
  useGSAP(
    () => {
      const container = containerRef.current

      if (!container) {
        return undefined
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = getMotionTargets(selector, container)

        if (!targets.length) {
          return undefined
        }

        const tween = gsap.fromTo(
          targets,
          { autoAlpha: 0, scale, x, y, filter: 'blur(1px)' },
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
            clearProps: 'opacity,visibility,transform,filter',
            delay,
            duration,
            ease: 'power2.out',
            overwrite: 'auto',
            stagger,
          },
        )

        return () => tween.kill()
      })

      return () => mm.revert()
    },
    {
      dependencies: [delay, duration, motionKey, scale, selector, stagger, x, y],
      revertOnUpdate: true,
      scope: containerRef,
    },
  )
}

type ElementEntranceOptions = {
  delay?: number
  duration?: number
  scale?: number
  x?: number
  y?: number
}

export function useGsapElementEntrance<TElement extends HTMLElement>(
  elementRef: RefObject<TElement | null>,
  motionKey: string | number | boolean | null,
  { delay = 0, duration = 0.18, scale = 0.985, x = 0, y = -4 }: ElementEntranceOptions = {},
) {
  useGSAP(
    () => {
      const element = elementRef.current

      if (!element) {
        return undefined
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.fromTo(
          element,
          { autoAlpha: 0, scale, x, y },
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            clearProps: 'opacity,visibility,transform',
            delay,
            duration,
            ease: 'power2.out',
            overwrite: 'auto',
          },
        )

        return () => tween.kill()
      })

      return () => mm.revert()
    },
    {
      dependencies: [delay, duration, motionKey, scale, x, y],
      revertOnUpdate: true,
      scope: elementRef,
    },
  )
}

type ElementPulseOptions = {
  duration?: number
  scale?: number
  x?: number
  y?: number
}

export function useGsapElementPulse<TElement extends HTMLElement>(
  elementRef: RefObject<TElement | null>,
  motionKey: string | number | boolean | null,
  { duration = 0.18, scale = 0.985, x = 0, y = 0 }: ElementPulseOptions = {},
) {
  useGSAP(
    () => {
      const element = elementRef.current

      if (!element || motionKey === null || motionKey === false || motionKey === 0) {
        return undefined
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.fromTo(
          element,
          { scale, x, y },
          {
            scale: 1,
            x: 0,
            y: 0,
            clearProps: 'transform',
            duration,
            ease: 'power2.out',
            overwrite: 'auto',
          },
        )

        return () => tween.kill()
      })

      return () => mm.revert()
    },
    {
      dependencies: [duration, motionKey, scale, x, y],
      revertOnUpdate: true,
      scope: elementRef,
    },
  )
}

type DisclosureOptions = {
  childSelector?: string
  duration?: number
}

export function useGsapDisclosure<TElement extends HTMLElement>(
  elementRef: RefObject<TElement | null>,
  open: boolean,
  { childSelector, duration = 0.2 }: DisclosureOptions = {},
) {
  const initializedRef = useRef(false)

  useLayoutEffect(() => {
    const element = elementRef.current

    if (!element) {
      return undefined
    }

    if (!initializedRef.current) {
      gsap.set(element, { display: open ? 'grid' : 'none' })
      initializedRef.current = true
      return undefined
    }

    if (reducedMotionIsActive()) {
      gsap.set(element, {
        autoAlpha: open ? 1 : 0,
        clearProps: 'height,overflow,opacity,visibility',
        display: open ? 'grid' : 'none',
      })
      return undefined
    }

    const ctx = gsap.context(() => {
      const childTargets = childSelector ? getMotionTargets(childSelector, element) : []
      const timeline = gsap.timeline({
        defaults: {
          ease: 'power2.out',
          overwrite: 'auto',
        },
      })

      if (open) {
        gsap.set(element, { display: 'grid', height: 'auto', overflow: 'hidden', autoAlpha: 1 })

        const targetHeight = element.offsetHeight

        timeline.fromTo(
          element,
          { height: 0, autoAlpha: 0 },
          {
            height: targetHeight,
            autoAlpha: 1,
            clearProps: 'height,overflow,opacity,visibility',
            duration,
          },
        )

        if (childTargets.length) {
          timeline.fromTo(
            childTargets,
            { autoAlpha: 0, x: -4 },
            {
              autoAlpha: 1,
              x: 0,
              clearProps: 'opacity,visibility,transform',
              duration: 0.16,
              stagger: 0.018,
            },
            '<0.04',
          )
        }

        return
      }

      timeline.fromTo(
        element,
        { height: element.offsetHeight, overflow: 'hidden', autoAlpha: 1 },
        {
          height: 0,
          autoAlpha: 0,
          duration,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(element, {
              clearProps: 'height,overflow,opacity,visibility',
              display: 'none',
            })
          },
        },
      )
    }, element)

    return () => ctx.revert()
  }, [childSelector, duration, elementRef, open])
}
