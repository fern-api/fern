export interface CombinedEntity {
    status: CombinedEntity.Status;
    /** Unique identifier. */
    id: string;
    /** Display name from Identifiable. */
    name?: string | undefined;
    /** A short summary. */
    summary?: string | undefined;
}
export declare namespace CombinedEntity {
    const Status: {
        readonly Active: "active";
        readonly Archived: "archived";
    };
    type Status = (typeof Status)[keyof typeof Status];
}
