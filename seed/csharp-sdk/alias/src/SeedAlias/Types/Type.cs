using System.Text.Json.Serialization;

#nullable enable

namespace SeedAlias;

public class Type
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
