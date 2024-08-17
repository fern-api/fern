using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record UpdateRequest
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float>? Values { get; set; }

    [JsonPropertyName("setMetadata")]
    public Dictionary<string, MetadataValue?>? SetMetadata { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    internal Proto.UpdateRequest ToProto()
    {
        var result = new Proto.UpdateRequest();
        result.Id = Id;
        if (Values != null && Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (SetMetadata != null)
        {
            result.SetMetadata = ProtoConverter.ToProtoStruct(SetMetadata);
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        return result;
    }
}
