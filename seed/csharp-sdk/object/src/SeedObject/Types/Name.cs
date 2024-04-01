using System.Text.Json.Serialization;

namespace SeedObject;

public class Name
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("value")]
    public string Value { get; init; }
}
