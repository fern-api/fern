using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record Usage
{
    [JsonPropertyName("units")]
    public uint? Units { get; set; }

    internal Proto.Usage ToProto()
    {
        var result = new Proto.Usage();
        if (Units != null)
        {
            result.Units = Units ?? 0U;
        }
        return result;
    }
}
