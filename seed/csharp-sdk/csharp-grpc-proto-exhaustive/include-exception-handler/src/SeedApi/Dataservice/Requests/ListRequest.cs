using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

namespace SeedApi;

public record ListRequest
{
    [JsonIgnore]
    public string? Prefix { get; set; }

    [JsonIgnore]
    public uint? Limit { get; set; }

    [JsonIgnore]
    public string? PaginationToken { get; set; }

    [JsonIgnore]
    public string? Namespace { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the ListRequest type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.ListRequest ToProto()
    {
        var result = new Proto.ListRequest();
        if (Prefix != null)
        {
            result.Prefix = Prefix ?? "";
        }
        if (Limit != null)
        {
            result.Limit = Limit ?? 0;
        }
        if (PaginationToken != null)
        {
            result.PaginationToken = PaginationToken ?? "";
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        return result;
    }
}
