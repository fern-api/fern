using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record DeleteResponse
{
    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Returns a new DeleteResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static DeleteResponse FromProto(ProtoDataV1Grpc.DeleteResponse value)
    {
        return new DeleteResponse();
    }

    /// <summary>
    /// Maps the DeleteResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.DeleteResponse ToProto()
    {
        return new ProtoDataV1Grpc.DeleteResponse();
    }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
