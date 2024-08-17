using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record UpdateResponse
{
    internal Proto.UpdateResponse ToProto()
    {
        return new Proto.UpdateResponse();
    }
}
