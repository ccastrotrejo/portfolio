import type { ReactNode } from 'react'

export const person = {
  name: 'Carlos Castro Trejo',
  role: 'Software Engineer',
  location: 'Brooklyn, New York',
  timeZone: 'America/New_York',
  city: 'New York',
  email: 'carlos_castro5156@outlook.es',
  github: 'https://github.com/ccastrotrejo',
  linkedin: 'https://www.linkedin.com/in/carloscastrotrejo/',
}

/** Props for links that open off-site. */
export const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

export const bio: ReactNode[] = [
  <>
    I’m a software engineer at{' '}
    <a href="https://azure.microsoft.com/products/logic-apps" {...ext}>Microsoft</a> in Brooklyn,
    where I’m the founding frontend engineer on Azure Logic Apps Automation, a new
    AI&#8209;powered platform for building workflows in plain language.
  </>,
  <>
    I care about interfaces that feel fast and work for everyone: streaming UI for long-running
    agents, performance budgets, and accessibility. Before New York I spent two years in Redmond on
    the Logic Apps designer and its VS Code extension, and before that I started out at BlueOptima
    in Guadalajara.
  </>,
  <>
    I studied computer science at Tec de Monterrey in Cuernavaca, Mexico. Outside work I build
    small things: a tiny city, a health dashboard, a protein viewer, and a dog that lives on my
    desktop.
  </>,
]

export interface Role {
  company: string
  title: string
  period: string
  summary: string
}

export const work: Role[] = [
  {
    company: 'Microsoft',
    title: 'Software Engineer II, Frontend',
    period: 'Sep 2024 – Present',
    summary: 'Founding frontend engineer on Azure Logic Apps Automation, built from 0 → 1',
  },
  {
    company: 'Microsoft',
    title: 'Software Engineer, Frontend',
    period: 'Mar 2022 – Sep 2024',
    summary: 'Cut Logic Apps Designer initial load time by 20%',
  },
  {
    company: 'BlueOptima',
    title: 'Graduate Frontend Engineer',
    period: 'Jan – Aug 2021',
    summary: 'Redesigned core product pages in React; customer retention up 12%',
  },
  {
    company: 'BlueOptima',
    title: 'Software Engineer Intern',
    period: 'Jul – Dec 2020',
    summary: 'Rebuilt the internal intranet with reusable React components',
  },
]

export interface Project {
  name: string
  blurb: string
  href: string
  kind: string
}

export const projects: Project[] = [
  {
    name: 'CitiVibe',
    blurb:
      'A miniature New York to leave running on a second screen: traffic, weather, and 328 people going about their day.',
    href: 'https://citivibe.vercel.app',
    kind: 'Live',
  },
  {
    name: 'Health Dashboard',
    blurb:
      'A self-hosted training and recovery dashboard for Whoop, Strava, and Garmin. Your data stays on your machine.',
    href: 'https://github.com/ccastrotrejo/HealthDashboardPublic',
    kind: 'Open source',
  },
  {
    name: 'BioTool Web',
    blurb:
      'A local-first protein structure workbench. Parsing and analysis run in the browser; nothing is uploaded.',
    href: 'https://github.com/ccastrotrejo/BioToolWebsite',
    kind: 'Open source',
  },
  {
    name: 'Copilot Pet',
    blurb:
      'A pixel-art dachshund that lives on your macOS desktop and reacts to what GitHub Copilot is doing.',
    href: 'https://github.com/ccastrotrejo/PetExtensionGithubCopilot',
    kind: 'macOS',
  },
]

export const links = [
  { label: 'GitHub', href: person.github },
  { label: 'LinkedIn', href: person.linkedin },
  { label: 'Email', href: `mailto:${person.email}` },
]
