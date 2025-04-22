using System.Text.Json.Serialization;
using System.Text.Json;
using System.Linq;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record IndexedData
{
    [JsonPropertyName("indices")]
    public IEnumerable<uint> Indices { get; set; } = new List<uint>();

    [JsonPropertyName("values")]
    public IEnumerable<float> Values { get; set; } = new List<float>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <summary>
    /// Returns a new IndexedData type from its Protobuf-equivalent representation.
    /// </summary>
    internal static IndexedData FromProto(ProtoDataV1Grpc.IndexedData value) {
        return new IndexedData{Indices = value.Indices?.ToList() ?? Enumerable.Empty<uint>(), Values = value.Values?.ToList() ?? Enumerable.Empty<float>()};
    }

    /// <summary>
    /// Maps the IndexedData type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.IndexedData ToProto() {
        var result = new ProtoDataV1Grpc.IndexedData();
        if (Indices.Any()) {
            result.Indices.AddRange(Indices);
        }
        if (Values.Any()) {
            result.Values.AddRange(Values);
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
