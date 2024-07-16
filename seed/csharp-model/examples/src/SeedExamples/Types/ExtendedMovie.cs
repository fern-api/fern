using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record ExtendedMovie
{
    [JsonPropertyName("cast")]
    public IEnumerable<string> Cast { get; init; } = new List<string>();

    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("prequel")]
    public string? Prequel { get; init; }

    [JsonPropertyName("title")]
    public required string Title { get; init; }

    [JsonPropertyName("from")]
    public required string From { get; init; }

    /// <summary>
    /// The rating scale is one to five stars
    /// </summary>
    [JsonPropertyName("rating")]
    public required double Rating { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("tag")]
    public required string Tag { get; init; }

    [JsonPropertyName("book")]
    public string? Book { get; init; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, object> Metadata { get; init; } = new Dictionary<string, object>();
}
