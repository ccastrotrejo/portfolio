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
    I’m a software engineer at Microsoft in Brooklyn and the founding frontend engineer on{' '}
    <a href="https://azure.microsoft.com/products/logic-apps" {...ext}>
      Azure Logic Apps Automation
    </a>
    . You describe a workflow in plain language and AI helps you build it.
  </>,
  <>
    Most of my time lately goes into streaming UI for AI agents that run for minutes at a time,
    which is harder to design for than it sounds. Before New York I spent two and a half years in Redmond on the
    Logic Apps designer and its VS Code extension. I started out at BlueOptima in Guadalajara.
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
    summary: 'Started the Azure Logic Apps Automation frontend from an empty repo',
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
      'A self-hosted dashboard for recovery, sleep, and training data from Whoop, Strava, and Garmin.',
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
