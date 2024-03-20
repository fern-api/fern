using System.Text.Json.Serialization

namespace SeedObjectClient

public class Name
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("value")]
    public string Value { get; init; }
}
