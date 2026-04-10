import { ast } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type ProtobufService = FernIr.ProtobufService;

/**
 * Information relevant to a particular gRPC client instance instantiated from a gRPC
 * channel (e.g. `var _userService = new UserService.UserServiceClient(channel);`).
 */
export interface GrpcClientInfo {
    privatePropertyName: string;
    classReference: ast.ClassReference;
    protobufService: ProtobufService;
}
