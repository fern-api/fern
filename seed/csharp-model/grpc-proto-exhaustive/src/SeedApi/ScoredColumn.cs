using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record ScoredColumn
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("score")]
    public float? Score { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float>? Values { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, MetadataValue?>? Metadata { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    /// <summary>
    /// Maps the ScoredColumn type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.ScoredColumn ToProto()
    {
        var result = new Proto.ScoredColumn();
        result.Id = Id;
        if (Score != null)
        {
            result.Score = Score ?? 0.0f;
        }
        if (Values != null && Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (Metadata != null)
        {
            result.Metadata = ProtoConverter.ToProtoStruct(Metadata);
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        return result;
    }

    /// <summary>
    /// Returns a new ScoredColumn type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ScoredColumn FromProto(Proto.ScoredColumn value)
    {
        return new ScoredColumn
        {
            Id = value.Id,
            Score = value.Score,
            Values = value.Values?.ToList(),
            Metadata = ProtoConverter.FromProtoStruct(value.Metadata),
            IndexedData =
                value.IndexedData != null ? IndexedData.FromProto(value.IndexedData) : null,
        };
    }
}
