export type FernToken = FernOrganizationToken | FernUserToken | FernGuestToken;

export interface FernOrganizationToken {
    type: "organization";
    value: string;
}
export interface FernUserToken {
    type: "user";
    value: string;
}
/** A Venus guest-session JWT, scoped to the throwaway `guest-<id>` organization it was minted for. */
export interface FernGuestToken {
    type: "guest";
    value: string;
    sessionId: string;
    organizationId: string;
    claimUrl: string;
    expiresAt: Date;
}
