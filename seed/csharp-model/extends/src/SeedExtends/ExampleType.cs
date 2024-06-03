using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public class ExampleType
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
