using System.Text.Json.Serialization;

namespace SeedExtends;

public class ExampleType
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
