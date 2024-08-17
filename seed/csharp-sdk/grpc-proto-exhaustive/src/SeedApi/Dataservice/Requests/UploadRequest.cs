using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record UploadRequest
{
    [JsonPropertyName("columns")]
    public IEnumerable<Column> Columns { get; set; } = new List<Column>();

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    internal Proto.UploadRequest ToProto()
    {
        var result = new Proto.UploadRequest();
        if (Columns.Any())
        {
            result.Columns.AddRange(Columns.Select(elem => elem.ToProto()));
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        return result;
    }
}
