using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record DescribeRequest
{
    [JsonPropertyName("filter")]
    public Metadata? Filter { get; set; }

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
        return result;
    }
}
