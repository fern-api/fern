import { ProtobufService } from "@fern-fern/ir-sdk/api";
import { type ClassReference } from "../ast";

/**
 * Information relevant to a particular gRPC client instance instantiated from a gRPC
 * channel (e.g. `var _userService = new UserService.UserServiceClient(channel);`).
 */
export interface GrpcClientInfo {
    privatePropertyName: string;
    classReference: ClassReference;
    protobufService: ProtobufService;
}
