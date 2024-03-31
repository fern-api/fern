using System.Text.Json.Serialization;

namespace Client;

public class Docs
{
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
