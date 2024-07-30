using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public record BootInstanceRequest
{
    [JsonPropertyName("size")]
    public required string Size { get; set; }
}
