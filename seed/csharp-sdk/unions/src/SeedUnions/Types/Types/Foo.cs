using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public class Foo
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
