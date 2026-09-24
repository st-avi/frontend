export type Articles = {
  list: {
    category: string
    category_slug: string
    title: string
    slug: string
  }[]
}

export type Tags = {
  tags: {
    name: string
    slug: string
  }[]
}
