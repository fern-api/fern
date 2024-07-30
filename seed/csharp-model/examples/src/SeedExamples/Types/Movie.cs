using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record Movie
{
    [JsonPropertyName("id")]
    public required string Id { get; }

    [JsonPropertyName("prequel")]
    public string? Prequel { get; }

    [JsonPropertyName("title")]
    public required string Title { get; }

    [JsonPropertyName("from")]
    public required string From { get; }

    /// <summary>
    /// The rating scale is one to five stars
    /// </summary>
    [JsonPropertyName("rating")]
    public required double Rating { get; }

    [JsonPropertyName("type")]
    public required string Type { get; }

    [JsonPropertyName("tag")]
    public required string Tag { get; }

    [JsonPropertyName("book")]
    public string? Book { get; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, object> Metadata { get; } = new Dictionary<string, object>();
}
