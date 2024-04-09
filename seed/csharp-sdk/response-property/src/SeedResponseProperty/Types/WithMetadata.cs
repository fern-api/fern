using System.Text.Json.Serialization;

namespace SeedResponseProperty;

public class WithMetadata
{
    [JsonPropertyName("metadata")]
    public List<Dictionary<string, string>> Metadata { get; init; }
}
