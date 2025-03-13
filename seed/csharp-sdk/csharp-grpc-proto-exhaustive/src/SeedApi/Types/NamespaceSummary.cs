using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record NamespaceSummary
{
    [JsonPropertyName("count")]
    public uint? Count { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the NamespaceSummary type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.NamespaceSummary ToProto()
    {
        var result = new ProtoDataV1Grpc.NamespaceSummary();
        if (Count != null)
        {
            result.Count = Count ?? 0;
        }
        return result;
    }

    /// <summary>
    /// Returns a new NamespaceSummary type from its Protobuf-equivalent representation.
    /// </summary>
    internal static NamespaceSummary FromProto(ProtoDataV1Grpc.NamespaceSummary value)
    {
        return new NamespaceSummary { Count = value.Count };
    }
}
