using System.Text.Json.Serialization;

#nullable enable

namespace SeedMultiUrlEnvironment;

public class BootInstanceRequest
{
    [JsonPropertyName("size")]
    public string Size { get; init; }
}
