using System.Text.Json.Serialization;
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
}
