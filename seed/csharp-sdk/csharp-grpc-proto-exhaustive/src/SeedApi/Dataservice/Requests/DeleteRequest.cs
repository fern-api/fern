using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

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
    public Metadata? Filter { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the DeleteRequest type into its Protobuf-equivalent representation.
    /// </summary>
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
            result.Filter = Filter.ToProto();
        }
        return result;
    }
}
