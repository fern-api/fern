using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record Movie
{
    [JsonPropertyName("id")]
    public required string Id { get; }

    [JsonPropertyName("title")]
    public required string Title { get; }

    /// <summary>
    /// The rating scale is one to five stars
    /// </summary>
    [JsonPropertyName("rating")]
    public required double Rating { get; }
}
