using System.Text.Json.Serialization;

namespace SeedExtends;

public class Json
{
    [JsonPropertyName("raw")]
    public string Raw { get; init; }

    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
