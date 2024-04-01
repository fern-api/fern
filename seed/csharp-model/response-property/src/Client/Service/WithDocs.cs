using System.Text.Json.Serialization;

namespace Client;

public class WithDocs
{
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
