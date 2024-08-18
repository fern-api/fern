using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record NamespaceSummary
{
    [JsonPropertyName("count")]
    public uint? Count { get; set; }

    /// <summary>
    /// Maps the NamespaceSummary type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.NamespaceSummary ToProto()
    {
        var result = new Proto.NamespaceSummary();
        if (Count != null)
        {
            result.Count = Count ?? 0U;
        }
        return result;
    }
}
