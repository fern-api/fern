using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record FetchResponse
{
    [JsonPropertyName("columns")]
    public Dictionary<string, Column>? Columns { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

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
    /// Returns a new FetchResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static FetchResponse FromProto(ProtoDataV1Grpc.FetchResponse value)
    {
        return new FetchResponse
        {
            Columns = value.Columns?.ToDictionary(
                kvp => kvp.Key,
                kvp => Column.FromProto(kvp.Value)
            ),
            Namespace = value.Namespace,
            Usage = value.Usage != null ? Usage.FromProto(value.Usage) : null,
        };
    }

    /// <summary>
    /// Maps the FetchResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.FetchResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.FetchResponse();
        if (Columns != null && Columns.Any())
        {
            foreach (var kvp in Columns)
            {
                result.Columns.Add(kvp.Key, kvp.Value.ToProto());
            }
            ;
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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
