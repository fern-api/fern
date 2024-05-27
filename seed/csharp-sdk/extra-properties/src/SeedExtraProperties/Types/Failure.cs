using System.Text.Json.Serialization;

namespace SeedExtraProperties;

public class Failure
{
    [JsonPropertyName("status")]
    public string Status { get; init; }
}
