using System.Text.Json.Serialization;

namespace Client;

public class MyObject
{
    [JsonPropertyName("foo")]
    public string Foo { get; init; }
}
