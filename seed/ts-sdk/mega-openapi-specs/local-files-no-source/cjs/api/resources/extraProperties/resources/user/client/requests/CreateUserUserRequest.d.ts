/**
 * @example
 *     {
 *         _type: "CreateUserRequest",
 *         _version: "v1",
 *         name: "Alice"
 *     }
 */
export interface CreateUserUserRequest {
    _type: CreateUserUserRequest.Type;
    _version: CreateUserUserRequest.Version;
    name: string;
}
export declare namespace CreateUserUserRequest {
    const Type: {
        readonly CreateUserRequest: "CreateUserRequest";
    };
    type Type = (typeof Type)[keyof typeof Type];
    const Version: {
        readonly V1: "v1";
    };
    type Version = (typeof Version)[keyof typeof Version];
}
