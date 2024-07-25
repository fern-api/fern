using System.Text.Json.Serialization;

#nullable enable

namespace SeedValidation;

public record Type
{
    [JsonPropertyName("decimal")]
    public required double Decimal { get; init; }

    [JsonPropertyName("even")]
    public required int Even { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }
}
