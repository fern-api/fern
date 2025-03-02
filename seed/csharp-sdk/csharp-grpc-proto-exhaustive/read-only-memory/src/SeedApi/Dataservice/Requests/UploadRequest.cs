using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

namespace SeedApi;

public record UploadRequest
{
    [JsonPropertyName("columns")]
    public IEnumerable<Column> Columns { get; set; } = new List<Column>();

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the UploadRequest type into its Protobuf-equivalent representation.
    /// </summary>
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
