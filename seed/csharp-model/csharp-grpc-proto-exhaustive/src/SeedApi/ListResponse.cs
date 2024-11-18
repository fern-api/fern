using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the ListResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.ListResponse ToProto()
    {
        var result = new Proto.ListResponse();
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

    /// <summary>
    /// Returns a new ListResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ListResponse FromProto(Proto.ListResponse value)
    {
        return new ListResponse
        {
            Columns = value.Columns?.Select(ListElement.FromProto),
            Pagination = value.Pagination != null ? Pagination.FromProto(value.Pagination) : null,
            Namespace = value.Namespace,
            Usage = value.Usage != null ? Usage.FromProto(value.Usage) : null,
        };
    }
}
