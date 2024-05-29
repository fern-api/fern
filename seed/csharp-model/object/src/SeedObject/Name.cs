using System.Text.Json.Serialization;

#nullable enable

namespace SeedObject;

public class Name
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("value")]
    public string Value { get; init; }
}
