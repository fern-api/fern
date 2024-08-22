using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record DescribeRequest
{
    [JsonPropertyName("filter")]
    public Metadata? Filter { get; set; }

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
