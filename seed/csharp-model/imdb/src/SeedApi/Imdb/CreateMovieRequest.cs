using System.Text.Json.Serialization;

namespace SeedApi;

public class CreateMovieRequest
{
    [JsonPropertyName("title")]
    public string Title { get; init; }

    [JsonPropertyName("rating")]
    public double Rating { get; init; }
}
