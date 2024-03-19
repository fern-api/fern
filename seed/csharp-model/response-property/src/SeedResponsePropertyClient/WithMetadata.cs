using System.Text.Json.Serialization

namespace SeedResponsePropertyClient

public class WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string,string> Metadata { get; init; }
}
