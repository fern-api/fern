export interface Failure {
    status: Failure.Status;
}
export declare namespace Failure {
    const Status: {
        readonly Failure: "failure";
    };
    type Status = (typeof Status)[keyof typeof Status];
}
