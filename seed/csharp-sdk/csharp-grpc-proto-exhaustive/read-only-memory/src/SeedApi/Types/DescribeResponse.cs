using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the DescribeResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.DescribeResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.DescribeResponse();
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
            result.Dimension = Dimension ?? 0;
        }
        if (Fullness != null)
        {
            result.Fullness = Fullness ?? 0.0f;
        }
        if (TotalCount != null)
        {
            result.TotalCount = TotalCount ?? 0;
        }
        return result;
    }

    /// <summary>
    /// Returns a new DescribeResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static DescribeResponse FromProto(ProtoDataV1Grpc.DescribeResponse value)
    {
        return new DescribeResponse
        {
            Namespaces = value.Namespaces?.ToDictionary(
                kvp => kvp.Key,
                kvp => NamespaceSummary.FromProto(kvp.Value)
            ),
            Dimension = value.Dimension,
            Fullness = value.Fullness,
            TotalCount = value.TotalCount,
        };
    }
}
