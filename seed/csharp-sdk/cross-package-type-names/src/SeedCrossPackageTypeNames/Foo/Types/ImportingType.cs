using System.Text.Json.Serialization;

#nullable enable

namespace SeedCrossPackageTypeNames;

public record ImportingType
{
    [JsonPropertyName("imported")]
    public required string Imported { get; set; }
}
