using System.Text.Json.Serialization;

#nullable enable

namespace SeedPackageYml;

public record EchoRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("size")]
    public required int Size { get; set; }
}
