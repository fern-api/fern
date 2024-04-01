using System.Text.Json.Serialization;

namespace Client;

public class Foo
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
