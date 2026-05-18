export declare const MigrationStatus: {
    readonly Running: "RUNNING";
    readonly Failed: "FAILED";
    readonly Finished: "FINISHED";
};
export type MigrationStatus = (typeof MigrationStatus)[keyof typeof MigrationStatus];
