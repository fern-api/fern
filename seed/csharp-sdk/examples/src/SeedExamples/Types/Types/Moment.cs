using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record Moment
{
    [JsonPropertyName("id")]
    public required Guid Id { get; init; }

    [JsonPropertyName("date")]
    public required DateOnly Date { get; init; }

    [JsonPropertyName("datetime")]
    public required DateTime Datetime { get; init; }
}
