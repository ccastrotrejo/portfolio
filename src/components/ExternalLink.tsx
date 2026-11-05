import type { ReactNode } from 'react'

interface ExternalLinkProps {
  href: string
  className?: string
  children: ReactNode
}

/** Off-site link: opens in a new tab, and says so to screen readers. */
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (opens in new tab)</span>
    </a>
  )
}
