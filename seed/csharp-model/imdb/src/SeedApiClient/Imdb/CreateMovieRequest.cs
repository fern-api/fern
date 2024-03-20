using System.Text.Json.Serialization

namespace SeedApiClient

public class CreateMovieRequest
{
    [JsonPropertyName("title")]
    public string Title { get; init; }

    [JsonPropertyName("rating")]
    public double Rating { get; init; }
}
