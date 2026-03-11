export interface Industry {
  slug: string
  name: string
  code: string
  headline: string
  subtitle: string
}

export const LANDING_SUBLINE =
  'No upfront cost. You only pay a flat monthly fee if you use it. Cancel anytime.'

export const industries: Industry[] = [
  {
    slug: 'construction',
    name: 'Construction',
    code: 'CONSTRUCTION-VIP',
    headline: 'We build your construction management platform.',
    subtitle: 'Projects, crews, budgets, timelines. Built exactly for how your company operates. In days, not months.',
  },
  {
    slug: 'insurance',
    name: 'Insurance',
    code: 'INSURANCE-VIP',
    headline: 'We build your insurance operations platform.',
    subtitle: 'Policies, claims, agents, renewals. One system built around your agency. In days, not months.',
  },
  {
    slug: 'staffing',
    name: 'Staffing & Recruiting',
    code: 'STAFFING-VIP',
    headline: 'We build your staffing & recruiting platform.',
    subtitle: 'Candidates, placements, clients, timesheets. Built exactly for how your agency works. In days, not months.',
  },
  {
    slug: 'law',
    name: 'Law Practice',
    code: 'LAW-VIP',
    headline: "We build your law firm's operations platform.",
    subtitle: 'Cases, clients, deadlines, billing. Built exactly for how your firm works. In days, not months.',
  },
  {
    slug: 'accounting',
    name: 'Accounting',
    code: 'ACCOUNTING-VIP',
    headline: "We build your accounting firm's platform.",
    subtitle: 'Clients, deadlines, documents, billing. Built exactly for how your practice works. In days, not months.',
  },
  {
    slug: 'marketing',
    name: 'Marketing & Advertising',
    code: 'MARKETING-VIP',
    headline: "We build your marketing agency's platform.",
    subtitle: 'Campaigns, clients, assets, reporting. Built exactly for how your agency works. In days, not months.',
  },
  {
    slug: 'architecture',
    name: 'Architecture & Planning',
    code: 'ARCHITECTURE-VIP',
    headline: "We build your architecture firm's platform.",
    subtitle: 'Projects, drawings, clients, timelines. Built exactly for how your studio works. In days, not months.',
  },
  {
    slug: 'health',
    name: 'Health, Wellness & Fitness',
    code: 'HEALTH-VIP',
    headline: 'We build your wellness business platform.',
    subtitle: 'Clients, bookings, programs, payments. Built exactly for how your business works. In days, not months.',
  },
  {
    slug: 'automotive',
    name: 'Automotive',
    code: 'AUTOMOTIVE-VIP',
    headline: 'We build your automotive business platform.',
    subtitle: 'Inventory, customers, service, sales. Built exactly for how your dealership works. In days, not months.',
  },
  {
    slug: 'medical',
    name: 'Medical Practice',
    code: 'MEDICAL-VIP',
    headline: "We build your clinic's management platform.",
    subtitle: 'Appointments, patients, staff, billing. Custom-built for your practice. In days, not months.',
  },
  {
    slug: 'financial-services',
    name: 'Financial Services',
    code: 'FINANCE-VIP',
    headline: 'We build your financial services platform.',
    subtitle: 'Clients, portfolios, compliance, reporting. Built exactly for how your firm works. In days, not months.',
  },
  {
    slug: 'it',
    name: 'Information Technology',
    code: 'IT-VIP',
    headline: "We build your IT company's operations platform.",
    subtitle: 'Projects, tickets, clients, SLAs. Built exactly for how your team works. In days, not months.',
  },
  {
    slug: 'consulting',
    name: 'Management Consulting',
    code: 'CONSULTING-VIP',
    headline: "We build your consulting firm's platform.",
    subtitle: 'Engagements, clients, deliverables, billing. Built exactly for how your firm works. In days, not months.',
  },
  {
    slug: 'hospitality',
    name: 'Hospitality',
    code: 'HOSPITALITY-VIP',
    headline: 'We build your hospitality management platform.',
    subtitle: 'Reservations, guests, staff, operations. Built exactly for how your property works. In days, not months.',
  },
  {
    slug: 'logistics',
    name: 'Logistics & Supply Chain',
    code: 'LOGISTICS-VIP',
    headline: 'We build your logistics platform.',
    subtitle: 'Routes, drivers, orders, inventory. One system built around your operation. In days, not months.',
  },
  {
    slug: 'environmental',
    name: 'Environmental Services',
    code: 'ENVIRONMENTAL-VIP',
    headline: 'We build your environmental services platform.',
    subtitle: 'Projects, compliance, fieldwork, reporting. Built exactly for how your company works. In days, not months.',
  },
  {
    slug: 'education',
    name: 'Education Management',
    code: 'EDUCATION-VIP',
    headline: 'We build your education management platform.',
    subtitle: 'Students, courses, faculty, enrollment. Built exactly for how your institution works. In days, not months.',
  },
  {
    slug: 'telecom',
    name: 'Telecommunications',
    code: 'TELECOM-VIP',
    headline: 'We build your telecom operations platform.',
    subtitle: 'Networks, subscribers, service tickets, billing. Built exactly for how your company works. In days, not months.',
  },
]

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug)
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug)
}
