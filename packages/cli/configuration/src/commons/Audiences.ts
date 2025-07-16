import { assertNever } from '@fern-api/core-utils'

export type Audiences = AllAudiences | SelectAudiences

export interface AllAudiences {
    type: 'all'
}

export interface SelectAudiences {
    type: 'select'
    audiences: string[]
}

export function combineAudiences(...allAudiences: [Audiences, ...Audiences[]]): Audiences {
    return allAudiences.reduce((combined, audiences) => {
        if (combined.type === 'all' && audiences.type === 'all') {
            return { type: 'all' }
        }
        return {
            type: 'select',
            audiences: [...getAudienceStrings(combined), ...getAudienceStrings(audiences)]
        }
    })
}

function getAudienceStrings(audiences: Audiences): string[] {
    switch (audiences.type) {
        case 'all':
            return []
        case 'select':
            return audiences.audiences
        default:
            assertNever(audiences)
    }
}
