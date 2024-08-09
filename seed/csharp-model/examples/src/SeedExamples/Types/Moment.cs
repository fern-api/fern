using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record Moment
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("date")]
    public required DateOnly Date { get; set; }

    [JsonPropertyName("datetime")]
    public required DateTime Datetime { get; set; }
}
