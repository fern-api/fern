using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironment;

public record BootInstanceRequest
{
    [JsonPropertyName("size")]
    public required string Size { get; set; }
}
