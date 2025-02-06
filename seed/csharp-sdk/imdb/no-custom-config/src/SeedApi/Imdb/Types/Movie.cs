using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record Movie
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("title")]
    public required string Title { get; set; }

    /// <summary>
    /// The rating scale is one to five stars
    /// </summary>
    [JsonPropertyName("rating")]
    public required double Rating { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
