using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public class CreateMovieRequest
{
    [JsonPropertyName("title")]
    public string Title { get; init; }

    [JsonPropertyName("rating")]
    public double Rating { get; init; }
}
