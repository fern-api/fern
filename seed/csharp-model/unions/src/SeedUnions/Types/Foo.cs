using System.Text.Json.Serialization;

namespace SeedUnions;

public class Foo
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
