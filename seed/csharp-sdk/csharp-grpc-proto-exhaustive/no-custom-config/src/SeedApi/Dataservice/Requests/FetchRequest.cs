using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

namespace SeedApi;

public record FetchRequest
{
    [JsonIgnore]
    public IEnumerable<string> Ids { get; set; } = new List<string>();

    [JsonIgnore]
    public string? Namespace { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the FetchRequest type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.FetchRequest ToProto()
    {
        var result = new Proto.FetchRequest();
        if (Ids.Any())
        {
            result.Ids.AddRange(Ids);
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        return result;
    }
}
