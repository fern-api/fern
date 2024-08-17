using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record FetchResponse
{
    [JsonPropertyName("columns")]
    public Dictionary<string, Column>? Columns { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

    internal Proto.FetchResponse ToProto()
    {
        var result = new Proto.FetchResponse();
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
}
