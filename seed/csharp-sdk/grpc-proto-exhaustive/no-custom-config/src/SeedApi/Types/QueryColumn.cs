using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the QueryColumn type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.QueryColumn ToProto()
    {
        var result = new Proto.QueryColumn();
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

    /// <summary>
    /// Returns a new QueryColumn type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryColumn FromProto(Proto.QueryColumn value)
    {
        return new QueryColumn
        {
            Values = value.Values?.ToList() ?? new List<float>(),
            TopK = value.TopK,
            Namespace = value.Namespace,
            Filter = value.Filter != null ? Metadata.FromProto(value.Filter) : null,
            IndexedData =
                value.IndexedData != null ? IndexedData.FromProto(value.IndexedData) : null,
        };
    }
}
