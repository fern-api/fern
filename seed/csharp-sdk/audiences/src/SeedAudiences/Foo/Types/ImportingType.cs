using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences;

public class ImportingType
{
    [JsonPropertyName("imported")]
    public string Imported { get; init; }
}
