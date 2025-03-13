using System.Linq;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record Column
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float> Values { get; set; } = new List<float>();

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the Column type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.Column ToProto()
    {
        var result = new ProtoDataV1Grpc.Column();
        result.Id = Id;
        if (Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (Metadata != null)
        {
            result.Metadata = Metadata.ToProto();
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        return result;
    }

    /// <summary>
    /// Returns a new Column type from its Protobuf-equivalent representation.
    /// </summary>
    internal static Column FromProto(ProtoDataV1Grpc.Column value)
    {
        return new Column
        {
            Id = value.Id,
            Values = value.Values?.ToList() ?? Enumerable.Empty<float>(),
            Metadata = value.Metadata != null ? Metadata.FromProto(value.Metadata) : null,
            IndexedData =
                value.IndexedData != null ? IndexedData.FromProto(value.IndexedData) : null,
        };
    }
}
