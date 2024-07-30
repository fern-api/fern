using System.Text.Json.Serialization;
using SeedValidation;

#nullable enable

namespace SeedValidation;

public record Type
{
    [JsonPropertyName("decimal")]
    public required double Decimal { get; }

    [JsonPropertyName("even")]
    public required int Even { get; }

    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("shape")]
    public required Shape Shape { get; }
}
