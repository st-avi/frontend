export type Articles = {
  list: {
    category: string
    category_slug: string
    title: string
    slug: string
  }[]
}

export type LatestArticles = {
  list: {
    category: string
    title: string
    slug: string
    summary: string
    cover_image: string
  }[]
}

export type Tags = {
  tags: {
    name: string
    slug: string
  }[]
}

export type Categories = {
  categories: {
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
