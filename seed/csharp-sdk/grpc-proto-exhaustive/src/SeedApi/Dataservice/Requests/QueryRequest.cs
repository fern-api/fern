using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record QueryRequest
{
    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("topK")]
    public required uint TopK { get; set; }

    [JsonPropertyName("filter")]
    public Dictionary<string, MetadataValue?>? Filter { get; set; }

    [JsonPropertyName("includeValues")]
    public bool? IncludeValues { get; set; }

    [JsonPropertyName("includeMetadata")]
    public bool? IncludeMetadata { get; set; }

    [JsonPropertyName("queries")]
    public IEnumerable<QueryColumn>? Queries { get; set; }

    [JsonPropertyName("column")]
    public IEnumerable<float>? Column { get; set; }

    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    internal Proto.QueryRequest ToProto()
    {
        var result = new Proto.QueryRequest();
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        result.TopK = TopK;
        if (Filter != null)
        {
            result.Filter = ProtoConverter.ToProtoStruct(Filter);
        }
        if (IncludeValues != null)
        {
            result.IncludeValues = IncludeValues ?? false;
        }
        if (IncludeMetadata != null)
        {
            result.IncludeMetadata = IncludeMetadata ?? false;
        }
        if (Queries != null && Queries.Any())
        {
            result.Queries.AddRange(Queries.Select(elem => elem.ToProto()));
        }
        if (Column != null && Column.Any())
        {
            result.Column.AddRange(Column);
        }
        if (Id != null)
        {
            result.Id = Id ?? "";
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        return result;
    }
}
