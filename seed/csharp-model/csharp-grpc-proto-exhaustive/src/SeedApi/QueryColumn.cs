using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record QueryColumn
{
    [JsonPropertyName("values")]
    public IEnumerable<float> Values { get; set; } = new List<float>();

    [JsonPropertyName("topK")]
    public uint? TopK { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("filter")]
    public Metadata? Filter { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Returns a new QueryColumn type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryColumn FromProto(ProtoDataV1Grpc.QueryColumn value)
    {
        return new QueryColumn
        {
            Values = value.Values?.ToList() ?? Enumerable.Empty<float>(),
            TopK = value.TopK,
            Namespace = value.Namespace,
            Filter = value.Filter != null ? Metadata.FromProto(value.Filter) : null,
            IndexedData =
                value.IndexedData != null ? IndexedData.FromProto(value.IndexedData) : null,
        };
    }

    /// <summary>
    /// Maps the QueryColumn type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.QueryColumn ToProto()
    {
        var result = new ProtoDataV1Grpc.QueryColumn();
        if (Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (TopK != null)
        {
            result.TopK = TopK ?? 0;
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (Filter != null)
        {
            result.Filter = Filter.ToProto();
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
