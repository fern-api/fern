using System.Text.Json.Serialization;
using SeedValidation;

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

    [JsonPropertyName("shape")]
    public required Shape Shape { get; init; }
}
