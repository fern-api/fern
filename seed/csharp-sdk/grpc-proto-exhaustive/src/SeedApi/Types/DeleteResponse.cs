using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record DeleteResponse
{
    /// <summary>
    /// Maps the DeleteResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.DeleteResponse ToProto()
    {
        return new Proto.DeleteResponse();
    }
}
