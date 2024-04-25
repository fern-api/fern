using System.Text.Json.Serialization;

namespace SeedExtraProperties;

public class Failure
{
    [JsonPropertyName("status")]
    public List<string> Status { get; init; }
}
