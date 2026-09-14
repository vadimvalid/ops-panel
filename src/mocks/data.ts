import type {
  Payment,
  PaymentStatus,
  Plan,
  Subscription,
  SubscriptionStatus,
  User,
  UserStatus,
  Role,
  PlanId,
} from '@/types/domain'

/** Deterministic PRNG so mock data is stable across reloads and test runs. */
function makeRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const rand = makeRandom(42)

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]!
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

function daysAhead(days: number): string {
  return daysAgo(-days)
}

export const plans: Plan[] = [
  { id: 'free', name: 'Free', priceMonthly: 0, currency: 'EUR' },
  { id: 'starter', name: 'Starter', priceMonthly: 1900, currency: 'EUR' },
  { id: 'pro', name: 'Pro', priceMonthly: 4900, currency: 'EUR' },
  { id: 'enterprise', name: 'Enterprise', priceMonthly: 19900, currency: 'EUR' },
]

const FIRST_NAMES = [
  'Anna', 'Marco', 'Julia', 'Tom', 'Sofia', 'Lukas', 'Elena', 'Piet',
  'Nadia', 'Omar', 'Clara', 'Ivan', 'Maja', 'Henrik', 'Laura', 'Diego',
]
const LAST_NAMES = [
  'Weber', 'Rossi', 'Novak', 'Hansen', 'Costa', 'Meyer', 'Petrov', 'Dubois',
  'Almeida', 'Kovacs', 'Lindgren', 'Haddad', 'Nowak', 'Berg', 'Ferrari',
]

const USER_STATUS_WEIGHTS: UserStatus[] = [
  ...Array<UserStatus>(14).fill('active'),
  ...Array<UserStatus>(4).fill('invited'),
  ...Array<UserStatus>(2).fill('suspended'),
]

const ROLE_WEIGHTS: Role[] = [
  ...Array<Role>(14).fill('viewer'),
  ...Array<Role>(4).fill('support'),
  ...Array<Role>(2).fill('admin'),
]

function buildUsers(count: number): User[] {
  const seen = new Set<string>()
  const users: User[] = []

  for (let i = 0; i < count; i += 1) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)

    // Emails must be unique; fall back to an index suffix on collision.
    let email = `${first}.${last}`.toLowerCase() + '@example.com'
    if (seen.has(email)) email = `${first}.${last}${i}`.toLowerCase() + '@example.com'
    seen.add(email)

    const status = pick(USER_STATUS_WEIGHTS)
    const createdDaysAgo = Math.floor(rand() * 400) + 1

    users.push({
      id: `usr_${String(i + 1).padStart(4, '0')}`,
      name: `${first} ${last}`,
      email,
      role: pick(ROLE_WEIGHTS),
      status,
      createdAt: daysAgo(createdDaysAgo),
      // Invited users have never signed in.
      lastSeenAt: status === 'invited' ? null : daysAgo(Math.floor(rand() * createdDaysAgo)),
      planId: status === 'invited' ? null : pick(plans).id,
    })
  }

  return users
}

const SUBSCRIPTION_STATUS_WEIGHTS: SubscriptionStatus[] = [
  ...Array<SubscriptionStatus>(12).fill('active'),
  ...Array<SubscriptionStatus>(3).fill('trialing'),
  ...Array<SubscriptionStatus>(3).fill('past_due'),
  ...Array<SubscriptionStatus>(2).fill('cancelled'),
]

function buildSubscriptions(users: User[]): Subscription[] {
  return users
    .filter((user): user is User & { planId: PlanId } => user.planId !== null && user.planId !== 'free')
    .map((user, index) => {
      const status = pick(SUBSCRIPTION_STATUS_WEIGHTS)
      const startedDaysAgo = Math.floor(rand() * 300) + 5

      return {
        id: `sub_${String(index + 1).padStart(4, '0')}`,
        userId: user.id,
        planId: user.planId,
        status,
        startedAt: daysAgo(startedDaysAgo),
        renewsAt: status === 'cancelled' ? null : daysAhead(Math.floor(rand() * 30) + 1),
        cancelledAt: status === 'cancelled' ? daysAgo(Math.floor(rand() * 30)) : null,
      }
    })
}

const PAYMENT_STATUS_WEIGHTS: PaymentStatus[] = [
  ...Array<PaymentStatus>(16).fill('succeeded'),
  ...Array<PaymentStatus>(2).fill('pending'),
  ...Array<PaymentStatus>(2).fill('failed'),
  'refunded',
]

function buildPayments(subscriptions: Subscription[]): Payment[] {
  const payments: Payment[] = []
  let counter = 1

  for (const subscription of subscriptions) {
    const plan = plans.find((p) => p.id === subscription.planId)!
    // One invoice per month since the subscription started, capped at a year.
    const months = Math.min(12, Math.floor(rand() * 10) + 1)

    for (let month = 0; month < months; month += 1) {
      payments.push({
        id: `pay_${String(counter).padStart(5, '0')}`,
        userId: subscription.userId,
        subscriptionId: subscription.id,
        amount: plan.priceMonthly,
        currency: plan.currency,
        status: month === 0 ? pick(PAYMENT_STATUS_WEIGHTS) : 'succeeded',
        createdAt: daysAgo(month * 30 + Math.floor(rand() * 5)),
        description: `${plan.name} — monthly`,
      })
      counter += 1
    }
  }

  return payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const users: User[] = buildUsers(120)
export const subscriptions: Subscription[] = buildSubscriptions(users)
export const payments: Payment[] = buildPayments(subscriptions)

/** Accounts offered on the login screen, one per role. */
export const credentials: Record<string, { password: string; userId: string }> = {
  'admin@example.com': { password: 'admin', userId: users[0]!.id },
  'support@example.com': { password: 'support', userId: users[1]!.id },
  'viewer@example.com': { password: 'viewer', userId: users[2]!.id },
}

// The demo accounts must actually carry the role they advertise.
users[0]!.role = 'admin'
users[0]!.name = 'Admin User'
users[0]!.email = 'admin@example.com'
users[0]!.status = 'active'
users[1]!.role = 'support'
users[1]!.name = 'Support User'
users[1]!.email = 'support@example.com'
users[1]!.status = 'active'
users[2]!.role = 'viewer'
users[2]!.name = 'Viewer User'
users[2]!.email = 'viewer@example.com'
users[2]!.status = 'active'
