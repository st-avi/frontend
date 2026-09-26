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

export type Article = {
  title: string
  summary: string
  content: string
  cover_image: string
  category: string
  published_at: string
  tags: {
    name: string
    slug: string
  }[]
}
