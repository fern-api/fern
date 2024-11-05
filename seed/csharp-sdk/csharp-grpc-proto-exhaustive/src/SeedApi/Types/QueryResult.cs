using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record QueryResult
{
    [JsonPropertyName("matches")]
    public IEnumerable<ScoredColumn>? Matches { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the QueryResult type into its Protobuf-equivalent representation.
    /// </summary>
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

    /// <summary>
    /// Returns a new QueryResult type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryResult FromProto(Proto.QueryResult value)
    {
        return new QueryResult
        {
            Matches = value.Matches?.Select(ScoredColumn.FromProto),
            Namespace = value.Namespace,
        };
    }
}
