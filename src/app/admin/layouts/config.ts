import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

const path = paths.admin

export const navItems = [
  { key: 'overview', title: 'ภาพรวม', href: path.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'ลูกค้า', href: path.customers, icon: 'user', matcher: { type: 'startsWith', href: path.customers } },
  { key: 'invoices', title: 'บิลทั้งหมด', href: path.invoice, icon: 'invoice', matcher: { type: 'startsWith', href: path.invoice } },
] satisfies NavItemConfig[];

export const navCEO = [
  { key: 'admin', title: 'แอดมิน', href: path.admin, icon: 'admin', matcher: { type: 'startsWith', href: path.admin } },
  { key: 'payment', title: 'ช่องทางการชำระเงิน', href: path.payment, icon: 'payment' },
] satisfies NavItemConfig[];