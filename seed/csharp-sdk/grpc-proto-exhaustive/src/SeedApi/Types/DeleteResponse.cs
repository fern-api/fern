using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record DeleteResponse
{
    internal Proto.DeleteResponse ToProto()
    {
        return new Proto.DeleteResponse();
    }
}
