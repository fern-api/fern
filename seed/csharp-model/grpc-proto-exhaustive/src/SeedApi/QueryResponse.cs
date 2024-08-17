using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record QueryResponse
{
    [JsonPropertyName("results")]
    public IEnumerable<QueryResult>? Results { get; set; }

    [JsonPropertyName("matches")]
    public IEnumerable<ScoredColumn>? Matches { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

    internal Proto.QueryResponse ToProto()
    {
        var result = new Proto.QueryResponse();
        if (Results != null && Results.Any())
        {
            result.Results.AddRange(Results.Select(elem => elem.ToProto()));
        }
        if (Matches != null && Matches.Any())
        {
            result.Matches.AddRange(Matches.Select(elem => elem.ToProto()));
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (Usage != null)
        {
            result.Usage = Usage.ToProto();
        }
        return result;
    }
}
