using System.Text.Json.Serialization

namespace SeedExamplesClient

public class ExtendedMovie
{
    [JsonPropertyName("cast")]
    public List<string> Cast { get; init; }

    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("prequel")]
    public string? Prequel { get; init; }

    [JsonPropertyName("title")]
    public string Title { get; init; }

    [JsonPropertyName("from")]
    public string From { get; init; }

    /// <summary>
    /// The rating scale is one to five stars
    /// </summary>
    [JsonPropertyName("rating")]
    public double Rating { get; init; }

    [JsonPropertyName("type")]
    public string Type { get; init; }

    [JsonPropertyName("tag")]
    public string Tag { get; init; }

    [JsonPropertyName("book")]
    public string? Book { get; init; }
}
