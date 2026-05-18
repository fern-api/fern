export interface BaseOrg {
    id: string;
    metadata?: BaseOrg.Metadata | undefined;
}
export declare namespace BaseOrg {
    interface Metadata {
        /** Deployment region from BaseOrg. */
        region: string;
        /** Subscription tier. */
        tier?: string | undefined;
    }
}
