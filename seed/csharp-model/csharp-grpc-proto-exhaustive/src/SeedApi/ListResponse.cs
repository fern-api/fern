using System.Text.Json.Serialization;
using System.Text.Json;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record ListResponse
{
    [JsonPropertyName("columns")]
    public IEnumerable<ListElement>? Columns { get; set; }

    [JsonPropertyName("pagination")]
    public Pagination? Pagination { get; set; }

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
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <summary>
    /// Returns a new ListResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListResponse FromProto(ProtoDataV1Grpc.ListResponse value) {
        return new ListResponse{Columns = value.Columns?.Select(ListElement.FromProto), Pagination = value.Pagination != null ? Pagination.FromProto(value.Pagination) : null, Namespace = value.Namespace, Usage = value.Usage != null ? Usage.FromProto(value.Usage) : null};
    }

    /// <summary>
    /// Maps the ListResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ListResponse ToProto() {
        var result = new ProtoDataV1Grpc.ListResponse();
        if (Columns != null && Columns.Any()) {
            result.Columns.AddRange(Columns.Select(elem => elem.ToProto()));
        }
        if (Pagination != null) {
            result.Pagination = Pagination.ToProto();
        }
        if (Namespace != null) {
            result.Namespace = Namespace ?? "";
        }
        if (Usage != null) {
            result.Usage = Usage.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
