/** Roles, ordered from least to most privileged. */
export const ROLES = ['viewer', 'support', 'admin'] as const
export type Role = (typeof ROLES)[number]

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  /** ISO 8601. */
  createdAt: string
  /** ISO 8601, null when the user has never signed in. */
  lastSeenAt: string | null
  planId: PlanId | null
}

export const USER_STATUSES = ['active', 'invited', 'suspended'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const PLAN_IDS = ['free', 'starter', 'pro', 'enterprise'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export interface Plan {
  id: PlanId
  name: string
  /** Minor units (cents) to avoid floating-point money. */
  priceMonthly: number
  currency: string
}

export interface Subscription {
  id: string
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  /** ISO 8601. */
  startedAt: string
  /** ISO 8601; null for open-ended subscriptions. */
  renewsAt: string | null
  cancelledAt: string | null
}

export const SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'cancelled'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export interface Payment {
  id: string
  userId: string
  subscriptionId: string | null
  /** Minor units. */
  amount: number
  currency: string
  status: PaymentStatus
  /** ISO 8601. */
  createdAt: string
  description: string
}

export const PAYMENT_STATUSES = ['succeeded', 'pending', 'failed', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

/** Envelope every list endpoint returns. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

export interface AuthSession {
  token: string
  user: User
}

export interface MonthlyPoint {
  /** "YYYY-MM". */
  month: string
  total: number
}

export interface StatsOverview {
  activeUsers: number
  activeSubscriptions: number
  pastDueSubscriptions: number
  /** Monthly recurring revenue, minor units. */
  mrr: number
  currency: string
  revenue: MonthlyPoint[]
  signups: MonthlyPoint[]
  planBreakdown: { planId: PlanId; name: string; count: number }[]
}
