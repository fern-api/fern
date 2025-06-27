using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record ListResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("columns")]
    public IEnumerable<ListElement>? Columns { get; set; }

    [JsonPropertyName("pagination")]
    public Pagination? Pagination { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new ListResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListResponse FromProto(ProtoDataV1Grpc.ListResponse value)
    {
        return new ListResponse
        {
            Columns = value.Columns?.Select(ListElement.FromProto),
            Pagination = value.Pagination != null ? Pagination.FromProto(value.Pagination) : null,
            Namespace = value.Namespace,
            Usage = value.Usage != null ? Usage.FromProto(value.Usage) : null,
        };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Maps the ListResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ListResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.ListResponse();
        if (Columns != null && Columns.Any())
        {
            result.Columns.AddRange(Columns.Select(elem => elem.ToProto()));
        }
        if (Pagination != null)
        {
            result.Pagination = Pagination.ToProto();
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
