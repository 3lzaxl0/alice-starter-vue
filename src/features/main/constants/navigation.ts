import type { Component } from 'vue'

export interface NavigationItem {
  label: string
  to: string
  icon: Component
  description?: string
  color?: string
  /** If set, only users with at least one of these roleIds can see this item */
  requiredRoles?: number[]
}

export const NAVIGATION_GROUPS: { title: string; items: NavigationItem[] }[] = []

// Flat list for backward compatibility
export const NAVIGATION_ITEMS: NavigationItem[] = NAVIGATION_GROUPS.flatMap((g) => g.items)
