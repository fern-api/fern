export interface Organization {
    name: string;
    id: string;
    metadata?: Organization.Metadata | undefined;
}
export declare namespace Organization {
    interface Metadata {
        /** Deployment region from BaseOrg. */
        region: string;
        /** Subscription tier. */
        tier?: string | undefined;
    }
}
