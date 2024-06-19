using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public class BootInstanceRequest
{
    [JsonPropertyName("size")]
    public string Size { get; init; }
}
