export declare const EventTypeEnum: {
    readonly GroupCreated: "group.created";
    readonly UserUpdated: "user.updated";
};
export type EventTypeEnum = (typeof EventTypeEnum)[keyof typeof EventTypeEnum];
