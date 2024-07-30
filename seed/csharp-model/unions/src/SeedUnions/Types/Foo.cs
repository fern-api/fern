using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public record Foo
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
