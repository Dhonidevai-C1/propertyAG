export function formatPrice(amount: number): string {
  if (!amount && amount !== 0) return ""
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatBudget(amount: number | null | undefined): string {
  if (!amount) return "0"
  if (amount >= 10000000) {
    return `₹${+(amount / 10000000).toFixed(2)}Cr`
  } else if (amount >= 100000) {
    return `₹${+(amount / 100000).toFixed(2)}L`
  } else if (amount >= 1000) {
    return `₹${+(amount / 1000).toFixed(2)}K`
  }
  return `₹${amount}`
}

export function formatBudgetRange(min: number | null | undefined, max: number | null | undefined): string {
  if (!min && !max) return "Any Budget"
  if (!min) return `Up to ${formatBudget(max)}`
  if (!max) return `${formatBudget(min)}+`
  return `${formatBudget(min)} – ${formatBudget(max)}`
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "Just now"
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

export function formatInitials(name: string): string {
  if (!name) return ""
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
