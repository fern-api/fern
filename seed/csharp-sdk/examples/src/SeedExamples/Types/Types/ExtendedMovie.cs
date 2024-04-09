using System.Text.Json.Serialization;

namespace SeedExamples;

public class ExtendedMovie
{
    [JsonPropertyName("cast")]
    public List<List<string>> Cast { get; init; }

    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("prequel")]
    public List<string?> Prequel { get; init; }

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
    public List<string> Type { get; init; }

    [JsonPropertyName("tag")]
    public string Tag { get; init; }

    [JsonPropertyName("book")]
    public List<string?> Book { get; init; }

    [JsonPropertyName("metadata")]
    public List<Dictionary<string, object>> Metadata { get; init; }
}
