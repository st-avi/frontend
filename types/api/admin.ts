export type AdminUser = {
  id: number
  username: string
  email: string
  phone_country: string
  phone_number: string
  role: string
  avatar: string
}

export type AdminUsers = {
  users: AdminUser[]
}
