using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public class Failure
{
    [JsonPropertyName("status")]
    public string Status { get; init; }
}
