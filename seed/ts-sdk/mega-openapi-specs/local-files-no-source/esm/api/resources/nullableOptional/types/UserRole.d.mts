/** Test enum for nullable enum fields */
export declare const UserRole: {
    readonly Admin: "ADMIN";
    readonly User: "USER";
    readonly Guest: "GUEST";
    readonly Moderator: "MODERATOR";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
