using System;
using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

namespace SeedApi;

public record UpdateRequest
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float>? Values { get; set; }

    [JsonPropertyName("setMetadata")]
    public Metadata? SetMetadata { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    [JsonPropertyName("indexType")]
    public IndexType? IndexType { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the UpdateRequest type into its Protobuf-equivalent representation.
    /// </summary>
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
            result.SetMetadata = SetMetadata.ToProto();
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        if (IndexType != null)
        {
            result.IndexType = (Proto.IndexType)Enum.Parse(typeof(Proto.IndexType), ToString());
        }
        return result;
    }
}
