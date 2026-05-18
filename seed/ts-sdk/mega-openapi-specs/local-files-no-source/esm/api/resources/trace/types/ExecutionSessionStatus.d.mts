export declare const ExecutionSessionStatus: {
    readonly CreatingContainer: "CREATING_CONTAINER";
    readonly ProvisioningContainer: "PROVISIONING_CONTAINER";
    readonly PendingContainer: "PENDING_CONTAINER";
    readonly RunningContainer: "RUNNING_CONTAINER";
    readonly LiveContainer: "LIVE_CONTAINER";
    readonly FailedToLaunch: "FAILED_TO_LAUNCH";
};
export type ExecutionSessionStatus = (typeof ExecutionSessionStatus)[keyof typeof ExecutionSessionStatus];
