using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record QueryResult
{
    [JsonPropertyName("matches")]
    public IEnumerable<ScoredColumn>? Matches { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Returns a new QueryResult type from its Protobuf-equivalent representation.
    /// </summary>
    internal static QueryResult FromProto(ProtoDataV1Grpc.QueryResult value)
    {
        return new QueryResult
        {
            Matches = value.Matches?.Select(ScoredColumn.FromProto),
            Namespace = value.Namespace,
        };
    }

    /// <summary>
    /// Maps the QueryResult type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.QueryResult ToProto()
    {
        var result = new ProtoDataV1Grpc.QueryResult();
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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
