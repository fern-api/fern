using System.Text.Json.Serialization;

namespace SeedMultiUrlEnvironment;

public class BootInstanceRequest
{
    [JsonPropertyName("size")]
    public string Size { get; init; }
}
