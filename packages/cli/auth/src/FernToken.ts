export type FernToken = FernOrganizationToken | FernUserToken

export interface FernOrganizationToken {
    type: "organization"
    value: string
}
export interface FernUserToken {
    type: "user"
    value: string
}
