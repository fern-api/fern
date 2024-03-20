using System.Text.Json.Serialization;

namespace SeedAudiencesClient;

public class ImportingType
{
    [JsonPropertyName("imported")]
    public string Imported { get; init; }
}
