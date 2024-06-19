using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public class Bar
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
