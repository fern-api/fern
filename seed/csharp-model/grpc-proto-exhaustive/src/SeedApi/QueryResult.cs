using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record QueryResult
{
    [JsonPropertyName("matches")]
    public IEnumerable<ScoredColumn>? Matches { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    internal Proto.QueryResult ToProto()
    {
        var result = new Proto.QueryResult();
        if (Matches != null && Matches.Any())
        {
            result.Matches.AddRange(Matches.Select(elem => elem.ToProto()));
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        return result;
    }
}
