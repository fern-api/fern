using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record Column
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("values")]
    public ReadOnlyMemory<float> Values { get; set; }

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
    internal Proto.Column ToProto()
    {
        var result = new Proto.Column();
        result.Id = Id;
        if (!Values.IsEmpty)
        {
            result.Values.AddRange(Values.ToArray());
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
    internal static Column FromProto(Proto.Column value)
    {
        return new Column
        {
            Id = value.Id,
            Values = value.Values?.ToArray() ?? new ReadOnlyMemory<float>(),
            Metadata = value.Metadata != null ? Metadata.FromProto(value.Metadata) : null,
            IndexedData =
                value.IndexedData != null ? IndexedData.FromProto(value.IndexedData) : null,
        };
    }
}
