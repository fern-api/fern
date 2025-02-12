using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record CreateMovieRequest
{
    [JsonPropertyName("title")]
    public required string Title { get; set; }

    [JsonPropertyName("rating")]
    public required double Rating { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
