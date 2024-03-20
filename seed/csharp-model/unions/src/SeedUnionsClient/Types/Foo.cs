using System.Text.Json.Serialization;

namespace SeedUnionsClient;

public class Foo
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
