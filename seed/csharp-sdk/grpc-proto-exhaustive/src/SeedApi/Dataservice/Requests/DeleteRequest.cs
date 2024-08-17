using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record DeleteRequest
{
    [JsonPropertyName("ids")]
    public IEnumerable<string>? Ids { get; set; }

    [JsonPropertyName("deleteAll")]
    public bool? DeleteAll { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("filter")]
    public Dictionary<string, MetadataValue?>? Filter { get; set; }

    internal Proto.DeleteRequest ToProto()
    {
        var result = new Proto.DeleteRequest();
        if (Ids != null && Ids.Any())
        {
            result.Ids.AddRange(Ids);
        }
        if (DeleteAll != null)
        {
            result.DeleteAll = DeleteAll ?? false;
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (Filter != null)
        {
            result.Filter = ProtoConverter.ToProtoStruct(Filter);
        }
        return result;
    }
}
