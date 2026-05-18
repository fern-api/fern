export interface DetailedOrg {
    metadata?: DetailedOrg.Metadata | undefined;
}
export declare namespace DetailedOrg {
    interface Metadata {
        /** Deployment region from DetailedOrg. */
        region: string;
        /** Custom domain name. */
        domain?: string | undefined;
    }
}
