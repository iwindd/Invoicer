export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/signin',
  },
  admin: {
    overview: '/admin',
    customers: '/admin/customers',
    invoice: '/admin/invoices',
    admin: '/admin/admin',
    payment: '/admin/payment'
  }
} as const;

export const routes = [
  { name: "home", path: '/', label: "หน้าแรก" },
  { name: "signin", path: '/auth/singin', label: "เข้าสู่ระบบ" },
  { name: "admin.dashboard", path: '/admin/', label: 'แดชบอร์ด' },
  { name: "admin.customer", path: '/admin/customers', label: 'ลูกค้า' },
  { name: "admin.customer.detail", path: '/admin/customers/:id', label: 'รายละเอียดลูกค้า' },
  { name: "admin.customer.detail.invoice.detail", path: '/admin/customers/:id/invoice/:iid', label: "รายละเอียดบิล"},
  { name: "admin.invoices", path: '/admin/invoices', label: 'บิลทั้งหมด' },
  { name: "admin.invoices.invoice", path: '/admin/invoices/:iid', label: 'รายละเอียดบิล' },
  { name: "admin.admin", path: '/admin/admin', label: 'แอดมิน' },
  { name: "admin.admin.detail", path: '/admin/admin/:id', label: 'รายละเอียดแอดมิน' },
  { name: "admin.payment", path: '/admin/payment', label: 'ช่องทางการชำระเงิน' },
] as {
  name: string,
  path: string,
  label: string
}[]