using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the QueryResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.QueryResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.QueryResponse();
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

    /// <summary>
    /// Returns a new QueryResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryResponse FromProto(ProtoDataV1Grpc.QueryResponse value)
    {
        return new QueryResponse
        {
            Results = value.Results?.Select(QueryResult.FromProto),
            Matches = value.Matches?.Select(ScoredColumn.FromProto),
            Namespace = value.Namespace,
            Usage = value.Usage != null ? Usage.FromProto(value.Usage) : null,
        };
    }
}
