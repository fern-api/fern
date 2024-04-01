using System.Text.Json.Serialization;

namespace SeedAudiences;

public class ImportingType
{
    [JsonPropertyName("imported")]
    public string Imported { get; init; }
}
