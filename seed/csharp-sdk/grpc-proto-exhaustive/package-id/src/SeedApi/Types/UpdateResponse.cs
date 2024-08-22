using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record UpdateResponse
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the UpdateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.UpdateResponse ToProto()
    {
        return new Proto.UpdateResponse();
    }

    /// <summary>
    /// Returns a new UpdateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UpdateResponse FromProto(Proto.UpdateResponse value)
    {
        return new UpdateResponse();
    }
}
