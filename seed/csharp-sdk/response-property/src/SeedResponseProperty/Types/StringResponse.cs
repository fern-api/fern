using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public class StringResponse
{
    [JsonPropertyName("data")]
    public string Data { get; init; }
}
