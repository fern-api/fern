using System.Text.Json.Serialization;

namespace Client;

public class ImportingType
{
    [JsonPropertyName("imported")]
    public string Imported { get; init; }
}
