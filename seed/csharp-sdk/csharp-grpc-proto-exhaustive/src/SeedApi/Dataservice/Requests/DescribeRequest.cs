using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

public record DescribeRequest
{
    [JsonPropertyName("filter")]
    public Metadata? Filter { get; set; }

    [JsonPropertyName("after")]
    public DateTime? After { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the DescribeRequest type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.DescribeRequest ToProto()
    {
        var result = new Proto.DescribeRequest();
        if (Filter != null)
        {
            result.Filter = Filter.ToProto();
        }
        if (After != null)
        {
            result.After = WellKnownProto.Timestamp.FromDateTime(After.Value.ToUniversalTime());
        }
        return result;
    }
}
