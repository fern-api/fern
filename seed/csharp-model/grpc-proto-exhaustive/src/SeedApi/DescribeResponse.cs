using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record DescribeResponse
{
    [JsonPropertyName("namespaces")]
    public Dictionary<string, NamespaceSummary>? Namespaces { get; set; }

    [JsonPropertyName("dimension")]
    public uint? Dimension { get; set; }

    [JsonPropertyName("fullness")]
    public float? Fullness { get; set; }

    [JsonPropertyName("totalCount")]
    public uint? TotalCount { get; set; }

    internal Proto.DescribeResponse ToProto()
    {
        var result = new Proto.DescribeResponse();
        if (Namespaces != null && Namespaces.Any())
        {
            foreach (var kvp in Namespaces)
            {
                result.Namespaces.Add(kvp.Key, kvp.Value.ToProto());
            }
            ;
        }
        if (Dimension != null)
        {
            result.Dimension = Dimension ?? 0U;
        }
        if (Fullness != null)
        {
            result.Fullness = Fullness ?? 0.0f;
        }
        if (TotalCount != null)
        {
            result.TotalCount = TotalCount ?? 0U;
        }
        return result;
    }
}
