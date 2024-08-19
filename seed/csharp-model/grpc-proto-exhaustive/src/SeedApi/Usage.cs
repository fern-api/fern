using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record Usage
{
    [JsonPropertyName("units")]
    public uint? Units { get; set; }

    /// <summary>
    /// Maps the Usage type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.Usage ToProto()
    {
        var result = new Proto.Usage();
        if (Units != null)
        {
            result.Units = Units ?? 0U;
        }
        return result;
    }

    /// <summary>
    /// Returns a new Usage type from its Protobuf-equivalent representation.
    /// </summary>
    internal static Usage FromProto(Proto.Usage value)
    {
        return new Usage { Units = value.Units };
    }
}
