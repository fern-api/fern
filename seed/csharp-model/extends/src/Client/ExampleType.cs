using System.Text.Json.Serialization;

namespace Client;

public class ExampleType
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
