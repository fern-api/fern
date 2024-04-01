using System.Text.Json.Serialization;

namespace SeedResponseProperty;

public class WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; init; }
}
