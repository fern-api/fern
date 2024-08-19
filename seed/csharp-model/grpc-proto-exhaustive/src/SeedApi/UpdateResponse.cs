using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record UpdateResponse
{
    /// <summary>
    /// Maps the UpdateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.UpdateResponse ToProto()
    {
        return new Proto.UpdateResponse();
    }
}
