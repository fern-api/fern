using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.A;

public record A
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
