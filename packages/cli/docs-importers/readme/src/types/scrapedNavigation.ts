export type scrapedNavigationSection = {
    type: 'group'
    group: string
    pages: scrapedNavigationEntry[]
}
export type scrapedNavigation = scrapedNavigationSection[]
export type scrapedNavigationGroup = {
    type: 'group'
    group: string
    pages: scrapedNavigationEntry[]
    version?: string
    icon?: string
    iconType?:
        | 'brands'
        | 'duotone'
        | 'light'
        | 'regular'
        | 'sharp-light'
        | 'sharp-regular'
        | 'sharp-solid'
        | 'sharp-thin'
        | 'solid'
        | 'thin'
}
export type scrapedNavigationPage = {
    type: 'page'
    page: string
    slug: string
}

export type scrapedNavigationEntry = scrapedNavigationGroup | scrapedNavigationPage
