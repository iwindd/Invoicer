import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

const path = paths.manager

export const navItems = [
  { key: 'overview', title: 'ภาพรวม', href: path.overview, icon: 'chart-pie' },
  { key: 'applications', title: 'แอพพลิเคชั่น', href: path.applications, icon: 'applications', matcher: { type: 'startsWith', href: path.applications } },
] satisfies NavItemConfig[];
