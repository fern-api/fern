using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences;

public record ImportingType
{
    [JsonPropertyName("imported")]
    public required string Imported { get; set; }
}
