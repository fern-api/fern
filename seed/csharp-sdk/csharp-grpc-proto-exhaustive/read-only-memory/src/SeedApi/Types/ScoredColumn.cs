using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record ScoredColumn
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("score")]
    public float? Score { get; set; }

    [JsonPropertyName("values")]
    public ReadOnlyMemory<float>? Values { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the ScoredColumn type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ScoredColumn ToProto()
    {
        var result = new ProtoDataV1Grpc.ScoredColumn();
        result.Id = Id;
        if (Score != null)
        {
            result.Score = Score ?? 0.0f;
        }
        if (Values != null && !Values.Value.IsEmpty)
        {
            result.Values.AddRange(Values.Value.ToArray());
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
    /// Returns a new ScoredColumn type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ScoredColumn FromProto(ProtoDataV1Grpc.ScoredColumn value)
    {
        return new ScoredColumn
        {
            Id = value.Id,
            Score = value.Score,
            Values = value.Values?.ToArray(),
            Metadata = value.Metadata != null ? Metadata.FromProto(value.Metadata) : null,
            IndexedData =
                value.IndexedData != null ? IndexedData.FromProto(value.IndexedData) : null,
        };
    }
}
