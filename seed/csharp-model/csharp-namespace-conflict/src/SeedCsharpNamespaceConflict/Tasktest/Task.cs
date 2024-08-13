using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict;

public record Task
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }
}
