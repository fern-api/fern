using System.Text.Json.Serialization;
using System.Text.Json;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record Pagination
{
    [JsonPropertyName("next")]
    public string? Next { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <summary>
    /// Returns a new Pagination type from its Protobuf-equivalent representation.
    /// </summary>
    internal static Pagination FromProto(ProtoDataV1Grpc.Pagination value) {
        return new Pagination{Next = value.Next};
    }

    /// <summary>
    /// Maps the Pagination type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.Pagination ToProto() {
        var result = new ProtoDataV1Grpc.Pagination();
        if (Next != null) {
            result.Next = Next ?? "";
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
