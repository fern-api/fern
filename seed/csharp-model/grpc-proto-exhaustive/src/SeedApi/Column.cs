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
    public IEnumerable<float> Values { get; set; } = new List<float>();

    [JsonPropertyName("metadata")]
    public Dictionary<string, MetadataValue?>? Metadata { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    internal Proto.Column ToProto()
    {
        var result = new Proto.Column();
        result.Id = Id;
        if (Values.Any())
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
}
