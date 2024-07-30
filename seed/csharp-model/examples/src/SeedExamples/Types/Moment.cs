using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record Moment
{
    [JsonPropertyName("id")]
    public required string Id { get; }

    [JsonPropertyName("date")]
    public required DateOnly Date { get; }

    [JsonPropertyName("datetime")]
    public required DateTime Datetime { get; }
}
